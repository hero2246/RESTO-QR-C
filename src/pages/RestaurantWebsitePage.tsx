import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Restaurant, Product, Category, OrderItem, SelectedOption } from '../types';
import { getRestaurantOpenStatus } from '../data/restaurantThemes';
import { formatFCFA } from '../utils/format';
import { 
  ShoppingBag, 
  Clock, 
  MapPin, 
  Phone, 
  MessageCircle, 
  Star, 
  Plus, 
  Minus, 
  X, 
  Check, 
  ChevronRight, 
  Utensils, 
  Sparkles, 
  Heart, 
  Send,
  Calendar,
  ExternalLink,
  QrCode,
  ArrowRight
} from 'lucide-react';

interface RestaurantWebsitePageProps {
  restaurant: Restaurant;
  navigate: (path: string) => void;
  tableParam?: string;
}

export const RestaurantWebsitePage: React.FC<RestaurantWebsitePageProps> = ({
  restaurant,
  navigate,
  tableParam,
}) => {
  const { 
    categories, 
    products, 
    tables, 
    createOrder, 
    getRestaurantWebsiteConfig, 
    addRestaurantReview,
    showToast 
  } = useApp();

  const config = getRestaurantWebsiteConfig(restaurant.id);
  const openStatus = getRestaurantOpenStatus(config.hours_schedule);

  // Cart State
  const [cart, setCart] = useState<{ product: Product; quantity: number; selectedOptions: SelectedOption[] }[]>([]);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [selectedTable, setSelectedTable] = useState<string>(tableParam || (tables[0]?.name || 'Table 1'));
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [customerNote, setCustomerNote] = useState<string>('');
  const [promoCodeInput, setPromoCodeInput] = useState<string>('');
  const [appliedPromo, setAppliedPromo] = useState<{ code: string; discountPercent: number } | null>(null);

  // Selected Category filter for Menu section
  const restoCategories = useMemo(() => {
    return categories.filter(c => c.restaurant_id === restaurant.id && c.is_visible);
  }, [categories, restaurant.id]);

  const [activeCategoryId, setActiveCategoryId] = useState<string>('ALL');

  const restoProducts = useMemo(() => {
    return products.filter(p => p.restaurant_id === restaurant.id && p.is_available);
  }, [products, restaurant.id]);

  const filteredProducts = useMemo(() => {
    if (activeCategoryId === 'ALL') return restoProducts;
    return restoProducts.filter(p => p.category_id === activeCategoryId);
  }, [restoProducts, activeCategoryId]);

  const featuredProducts = useMemo(() => {
    if (restaurant.featured_product_ids && restaurant.featured_product_ids.length > 0) {
      return restoProducts.filter(p => restaurant.featured_product_ids?.includes(p.id));
    }
    return restoProducts.slice(0, 3);
  }, [restoProducts, restaurant.featured_product_ids]);

  // Gallery active category filter
  const [galleryCategory, setGalleryCategory] = useState<string>('TOUS');

  const filteredGallery = useMemo(() => {
    if (galleryCategory === 'TOUS') return config.gallery_images;
    return config.gallery_images.filter(img => img.category?.toLowerCase() === galleryCategory.toLowerCase());
  }, [config.gallery_images, galleryCategory]);

  // Review submission modal state
  const [isReviewModalOpen, setIsReviewModalOpen] = useState<boolean>(false);
  const [reviewAuthor, setReviewAuthor] = useState<string>('');
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [reviewComment, setReviewComment] = useState<string>('');

  // Cart calculations
  const cartSubtotal = cart.reduce((sum, item) => {
    const optionsCost = item.selectedOptions.reduce((oSum, opt) => oSum + opt.price, 0);
    return sum + (item.product.price + optionsCost) * item.quantity;
  }, 0);

  const discountAmount = appliedPromo ? Math.round((cartSubtotal * appliedPromo.discountPercent) / 100) : 0;
  const cartTotal = Math.max(0, cartSubtotal - discountAmount);
  const cartCount = cart.reduce((c, item) => c + item.quantity, 0);

  // Cart actions
  const addToCart = (product: Product, selectedOptions: SelectedOption[] = []) => {
    setCart(prev => {
      const existingIndex = prev.findIndex(item => item.product.id === product.id);
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += 1;
        return updated;
      }
      return [...prev, { product, quantity: 1, selectedOptions }];
    });
    showToast(`${product.name} ajouté au panier`, 'info');
  };

  const updateCartQuantity = (index: number, delta: number) => {
    setCart(prev => {
      const updated = [...prev];
      const newQty = updated[index].quantity + delta;
      if (newQty <= 0) {
        return updated.filter((_, i) => i !== index);
      }
      updated[index].quantity = newQty;
      return updated;
    });
  };

  const handleApplyPromo = () => {
    const code = promoCodeInput.trim().toUpperCase();
    const promo = (config.promotions || []).find(p => p.code.toUpperCase() === code && p.is_active);
    if (promo) {
      setAppliedPromo({ code: promo.code, discountPercent: promo.discount_percent });
      showToast(`Code promo appliqué : -${promo.discount_percent}% sur votre commande !`, 'success');
      setPromoCodeInput('');
    } else {
      showToast('Code promotionnel invalide ou expiré', 'error');
    }
  };

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;

    const orderItems: OrderItem[] = cart.map(item => {
      const optionsCost = item.selectedOptions.reduce((s, o) => s + o.price, 0);
      const unit = item.product.price + optionsCost;
      return {
        product_id: item.product.id,
        product_name: item.product.name,
        quantity: item.quantity,
        unit_price: unit,
        selected_options: item.selectedOptions,
        subtotal: unit * item.quantity,
      };
    });

    const newOrder = createOrder({
      restaurant_id: restaurant.id,
      table_number: selectedTable,
      customer_name: customerName.trim() || undefined,
      customer_phone: customerPhone.trim() || undefined,
      customer_note: (customerNote.trim() + (appliedPromo ? ` [Code: ${appliedPromo.code} -${appliedPromo.discountPercent}%]` : '')).trim() || undefined,
      items: orderItems,
      total_amount: cartTotal,
    });

    setCart([]);
    setIsCartOpen(false);
    navigate(`/order/${newOrder.id}`);
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewAuthor.trim() || !reviewComment.trim()) return;

    addRestaurantReview(restaurant.id, {
      restaurant_id: restaurant.id,
      author_name: reviewAuthor.trim(),
      rating: reviewRating,
      comment: reviewComment.trim(),
    });

    setReviewAuthor('');
    setReviewComment('');
    setReviewRating(5);
    setIsReviewModalOpen(false);
  };

  const primaryColor = config.colors.primary || restaurant.primary_color || '#ea580c';
  const secondaryColor = config.colors.secondary || restaurant.secondary_color || '#0f172a';
  const accentColor = config.colors.accent || '#f59e0b';
  const bgColor = config.colors.background || '#f8fafc';
  const textColor = config.colors.text || '#0f172a';
  const surfaceColor = config.colors.surface || '#ffffff';

  const buttonRadiusClass = 
    config.style.button_radius === 'full' ? 'rounded-full' :
    config.style.button_radius === 'lg' ? 'rounded-2xl' :
    config.style.button_radius === 'md' ? 'rounded-xl' :
    config.style.button_radius === 'sm' ? 'rounded-lg' : 'rounded-none';

  const cardRadiusClass = 
    config.style.card_radius === 'xl' ? 'rounded-3xl' :
    config.style.card_radius === 'lg' ? 'rounded-2xl' :
    config.style.card_radius === 'md' ? 'rounded-xl' :
    config.style.card_radius === 'sm' ? 'rounded-lg' : 'rounded-none';

  return (
    <div 
      className="min-h-screen font-sans selection:bg-orange-500 selection:text-white"
      style={{ backgroundColor: bgColor, color: textColor }}
    >
      {/* ====================================================================== */}
      {/* 1. RESTAURANT TOP NAVIGATION BAR (STRICTEMENT ISOLÉ DU SAAS) */}
      {/* ====================================================================== */}
      <header 
        className="sticky top-0 z-40 backdrop-blur-md border-b transition-all"
        style={{ 
          backgroundColor: `${surfaceColor}ee`, 
          borderColor: 'rgba(0,0,0,0.06)' 
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-3.5">
            {Boolean(restaurant.logo?.trim()) ? (
              <img 
                src={restaurant.logo} 
                alt={restaurant.name} 
                className="w-12 h-12 rounded-xl object-cover shadow-xs border border-stone-200"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-xs"
                style={{ backgroundColor: primaryColor }}
              >
                {restaurant.name.charAt(0)}
              </div>
            )}
            <div>
              <div className="text-xl font-extrabold tracking-tight" style={{ color: textColor }}>
                {restaurant.name}
              </div>
              <div className="flex items-center gap-2 text-xs font-medium">
                <span className={`inline-flex items-center gap-1 font-semibold ${openStatus.isOpen ? 'text-emerald-600' : 'text-stone-500'}`}>
                  <span className={`w-2 h-2 rounded-full ${openStatus.isOpen ? 'bg-emerald-500 animate-pulse' : 'bg-stone-400'}`} />
                  {openStatus.isOpen ? 'Ouvert' : 'Fermé'}
                </span>
                {restaurant.city && (
                  <span className="text-stone-600">• {restaurant.city}</span>
                )}
              </div>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-7 text-sm font-semibold text-stone-600">
            {config.sections_visibility.featured_products && (
              <a href="#specialites" className="hover:text-stone-950 transition">Spécialités</a>
            )}
            {config.sections_visibility.menu && (
              <a href="#menu" className="hover:text-stone-950 transition">La Carte</a>
            )}
            {config.sections_visibility.about && (
              <a href="#apropos" className="hover:text-stone-950 transition">Notre Histoire</a>
            )}
            {config.sections_visibility.gallery && (
              <a href="#galerie" className="hover:text-stone-950 transition">Galerie</a>
            )}
            {config.sections_visibility.hours && (
              <a href="#horaires" className="hover:text-stone-950 transition">Horaires</a>
            )}
            {config.sections_visibility.reviews && (
              <a href="#avis" className="hover:text-stone-950 transition">Avis Clients</a>
            )}
            {config.sections_visibility.contact && (
              <a href="#contact" className="hover:text-stone-950 transition">Contact</a>
            )}
          </nav>

          {/* Action buttons: Mode QR & Cart Trigger */}
          <div className="flex items-center gap-3">
            {/* Quick Link to Table QR Menu */}
            <button
              onClick={() => navigate(`/r/${restaurant.slug}`)}
              className={`hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold border border-stone-200 hover:bg-stone-100 transition ${buttonRadiusClass}`}
              title="Passer en mode Menu QR sur table"
            >
              <QrCode className="w-4 h-4 text-stone-700" />
              <span>Menu QR Table</span>
            </button>

            {/* Cart Trigger */}
            <button
              onClick={() => setIsCartOpen(true)}
              className={`relative flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-white shadow-md transition transform active:scale-95 ${buttonRadiusClass}`}
              style={{ backgroundColor: primaryColor }}
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="hidden sm:inline">Panier</span>
              {cartCount > 0 && (
                <span className="bg-white text-stone-900 text-xs px-2 py-0.5 rounded-full font-black ml-1">
                  {cartCount}
                </span>
              )}
            </button>
          </div>

        </div>
      </header>

      {/* ====================================================================== */}
      {/* 2. HERO SECTION */}
      {/* ====================================================================== */}
      {config.sections_visibility.hero && (
        <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              
              {/* Text column */}
              <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
                {config.hero.badge_text && (
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-200">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    <span>{config.hero.badge_text}</span>
                  </div>
                )}

                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1]">
                  {config.hero.title}
                </h1>

                <p className="text-lg sm:text-xl text-stone-600 max-w-2xl font-normal leading-relaxed">
                  {config.hero.subtitle}
                </p>

                {/* Status and Action Buttons */}
                <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-4">
                  <a
                    href="#menu"
                    className={`inline-flex items-center justify-center gap-2 px-7 py-4 text-base font-extrabold text-white shadow-lg transition transform hover:-translate-y-0.5 active:translate-y-0 ${buttonRadiusClass}`}
                    style={{ backgroundColor: primaryColor }}
                  >
                    <Utensils className="w-5 h-5" />
                    <span>{config.hero.cta_menu_text || 'Consulter la Carte'}</span>
                  </a>

                  <button
                    onClick={() => setIsCartOpen(true)}
                    className={`inline-flex items-center justify-center gap-2 px-7 py-4 text-base font-extrabold bg-stone-900 text-white shadow-md hover:bg-stone-800 transition ${buttonRadiusClass}`}
                  >
                    <ShoppingBag className="w-5 h-5 text-orange-400" />
                    <span>{config.hero.cta_order_text || 'Commander en Ligne'}</span>
                  </button>
                </div>

                {/* Open Status live pill */}
                <div className="pt-4 flex items-center justify-center lg:justify-start gap-3 text-sm text-stone-600">
                  <Clock className="w-4 h-4 text-stone-600" />
                  <span>{openStatus.statusText}</span>
                  {restaurant.address && (
                    <>
                      <span className="text-stone-300">•</span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4 text-stone-600" />
                        {restaurant.address}
                      </span>
                    </>
                  )}
                </div>

              </div>

              {/* Visual column */}
              <div className="lg:col-span-5 relative">
                <div className={`relative overflow-hidden shadow-2xl border-4 border-white ${cardRadiusClass}`}>
                  <img 
                    src={config.hero.image_url || restaurant.cover_image || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200&auto=format&fit=crop&q=80'} 
                    alt={restaurant.name}
                    className="w-full h-[380px] sm:h-[480px] object-cover hover:scale-105 transition duration-700"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute bottom-6 left-6 right-6 text-white">
                    <div className="text-xs font-bold uppercase tracking-wider text-amber-300">
                      Gastronomie & Convivialité
                    </div>
                    <div className="text-2xl font-black mt-1">
                      {restaurant.name}
                    </div>
                    <p className="text-xs text-stone-200 mt-1 line-clamp-2">
                      {restaurant.description}
                    </p>
                  </div>
                </div>

                {/* Floating promo badge if promo active */}
                {config.promotions.length > 0 && config.promotions[0].is_active && (
                  <div className="absolute -bottom-5 -left-5 bg-white p-4 rounded-2xl shadow-xl border border-stone-200 hidden sm:flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center font-black text-lg">
                      %
                    </div>
                    <div>
                      <div className="text-xs font-bold text-stone-900">{config.promotions[0].title}</div>
                      <div className="text-[11px] text-stone-600 font-mono font-bold">Code : {config.promotions[0].code}</div>
                    </div>
                  </div>
                )}
              </div>

            </div>
          </div>
        </section>
      )}

      {/* ====================================================================== */}
      {/* 3. FEATURED DISHES / SPÉCIALITÉS DU CHEF */}
      {/* ====================================================================== */}
      {config.sections_visibility.featured_products && featuredProducts.length > 0 && (
        <section id="specialites" className="py-16 sm:py-24 bg-white border-y border-stone-200/60">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="text-xs font-bold uppercase tracking-wider text-orange-600">
                Nos Incontournables
              </span>
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight mt-1 text-stone-900">
                Les Spécialités de la Maison
              </h2>
              <p className="text-sm sm:text-base text-stone-600 mt-2">
                Sélectionnés avec passion par notre brigade pour éveiller vos papilles.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredProducts.map(product => (
                <div 
                  key={product.id}
                  className={`bg-stone-50 border border-stone-200 overflow-hidden shadow-xs hover:shadow-lg transition-all group flex flex-col justify-between ${cardRadiusClass}`}
                >
                  <div className="relative h-56 overflow-hidden">
                    <img 
                      src={product.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80'} 
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-3 right-3 px-3 py-1 bg-stone-900/80 backdrop-blur-md text-white font-extrabold text-xs rounded-full">
                      {formatFCFA(product.price)}
                    </div>
                  </div>

                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-stone-900 group-hover:text-orange-600 transition">
                        {product.name}
                      </h3>
                      <p className="text-xs sm:text-sm text-stone-600 mt-2 line-clamp-2">
                        {product.description}
                      </p>
                    </div>

                    <div className="pt-5 mt-4 border-t border-stone-200 flex items-center justify-between">
                      <span className="text-lg font-black text-stone-900">
                        {formatFCFA(product.price)}
                      </span>
                      <button
                        onClick={() => addToCart(product)}
                        className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white shadow-xs transition hover:brightness-110 active:scale-95 ${buttonRadiusClass}`}
                        style={{ backgroundColor: primaryColor }}
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Commander</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ====================================================================== */}
      {/* 4. FULL MENU / LA CARTE INTERACTIVE */}
      {/* ====================================================================== */}
      {config.sections_visibility.menu && (
        <section id="menu" className="py-16 sm:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-10">
              <span className="text-xs font-bold uppercase tracking-wider text-orange-600">
                La Carte Complète
              </span>
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight mt-1 text-stone-900">
                Découvrez Tous Nos Plats
              </h2>
              <p className="text-sm sm:text-base text-stone-600 mt-2">
                Commandez directement en ligne pour votre table ou à emporter.
              </p>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center justify-center gap-2 overflow-x-auto pb-4 mb-10 no-scrollbar">
              <button
                onClick={() => setActiveCategoryId('ALL')}
                className={`px-4 py-2 text-xs font-bold transition whitespace-nowrap ${buttonRadiusClass} ${
                  activeCategoryId === 'ALL'
                    ? 'text-white shadow-sm'
                    : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-50'
                }`}
                style={{ backgroundColor: activeCategoryId === 'ALL' ? primaryColor : undefined }}
              >
                Tous les Plats ({restoProducts.length})
              </button>

              {restoCategories.map(cat => {
                const count = restoProducts.filter(p => p.category_id === cat.id).length;
                const isActive = activeCategoryId === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategoryId(cat.id)}
                    className={`px-4 py-2 text-xs font-bold transition whitespace-nowrap ${buttonRadiusClass} ${
                      isActive
                        ? 'text-white shadow-sm'
                        : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-50'
                    }`}
                    style={{ backgroundColor: isActive ? primaryColor : undefined }}
                  >
                    {cat.name} ({count})
                  </button>
                );
              })}
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredProducts.map(product => (
                <div 
                  key={product.id}
                  className={`bg-white border border-stone-200 overflow-hidden shadow-xs hover:shadow-md transition flex flex-col justify-between ${cardRadiusClass}`}
                >
                  <div className="relative h-44 overflow-hidden">
                    <img 
                      src={product.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=80'} 
                      alt={product.name}
                      className="w-full h-full object-cover hover:scale-105 transition duration-300"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-2.5 right-2.5 px-2.5 py-0.5 bg-stone-900/80 backdrop-blur-md text-white font-bold text-xs rounded-full">
                      {formatFCFA(product.price)}
                    </div>
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="font-bold text-stone-900 text-base">{product.name}</h4>
                      <p className="text-xs text-stone-600 mt-1 line-clamp-2">
                        {product.description}
                      </p>
                    </div>

                    <div className="pt-3 mt-3 border-t border-stone-100 flex items-center justify-between">
                      <span className="font-extrabold text-stone-900 text-sm">
                        {formatFCFA(product.price)}
                      </span>
                      <button
                        onClick={() => addToCart(product)}
                        className={`p-2 text-white shadow-xs hover:brightness-110 active:scale-95 transition ${buttonRadiusClass}`}
                        style={{ backgroundColor: primaryColor }}
                        title="Ajouter au panier"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredProducts.length === 0 && (
              <div className="text-center py-16 text-stone-600 text-sm">
                Aucun plat disponible dans cette catégorie pour le moment.
              </div>
            )}
          </div>
        </section>
      )}

      {/* ====================================================================== */}
      {/* 5. ABOUT SECTION / NOTRE HISTOIRE */}
      {/* ====================================================================== */}
      {config.sections_visibility.about && (
        <section id="apropos" className="py-16 sm:py-24 bg-stone-100/70 border-y border-stone-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              
              <div className="lg:col-span-6 relative">
                <img 
                  src={config.about.image_url || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop&q=80'} 
                  alt="Notre savoir-faire" 
                  className={`w-full h-[400px] sm:h-[460px] object-cover shadow-xl border-4 border-white ${cardRadiusClass}`}
                  referrerPolicy="no-referrer"
                />
                {config.about.chef_name && (
                  <div className="absolute -bottom-6 -right-6 bg-stone-900 text-white p-5 rounded-2xl shadow-xl max-w-xs hidden sm:block">
                    <div className="text-xs font-bold text-amber-400 uppercase tracking-wider">Chef & Fondateur</div>
                    <div className="text-base font-black mt-0.5">{config.about.chef_name}</div>
                    <p className="text-xs text-stone-300 mt-1">« La qualité sans concession pour faire de chaque repas un moment inoubliable. »</p>
                  </div>
                )}
              </div>

              <div className="lg:col-span-6 space-y-6">
                <span className="text-xs font-bold uppercase tracking-wider text-orange-600">
                  {config.about.subtitle || 'Identité & Tradition'}
                </span>
                <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-stone-900 leading-tight">
                  {config.about.title}
                </h2>
                <p className="text-base sm:text-lg text-stone-600 leading-relaxed whitespace-pre-line">
                  {config.about.story}
                </p>

                <div className="pt-4 grid grid-cols-2 gap-4">
                  <div className="p-4 bg-white rounded-2xl border border-stone-200 shadow-2xs">
                    <div className="text-2xl font-black text-orange-600">100%</div>
                    <div className="text-xs font-bold text-stone-800 mt-1">Produits Frais</div>
                    <div className="text-xs text-stone-600 mt-0.5">Approvisionnement quotidien</div>
                  </div>
                  <div className="p-4 bg-white rounded-2xl border border-stone-200 shadow-2xs">
                    <div className="text-2xl font-black text-orange-600">Fait Maison</div>
                    <div className="text-xs font-bold text-stone-800 mt-1">Recettes Authentiques</div>
                    <div className="text-xs text-stone-600 mt-0.5">Préparé à la minute</div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>
      )}

      {/* ====================================================================== */}
      {/* 6. PHOTO GALLERY */}
      {/* ====================================================================== */}
      {config.sections_visibility.gallery && config.gallery_images.length > 0 && (
        <section id="galerie" className="py-16 sm:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-10">
              <span className="text-xs font-bold uppercase tracking-wider text-orange-600">
                Atmosphère & Plats
              </span>
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight mt-1 text-stone-900">
                Galerie Photos
              </h2>
              <p className="text-sm sm:text-base text-stone-600 mt-2">
                Un aperçu de nos créations gourmandes et de l'ambiance qui vous attend.
              </p>
            </div>

            {/* Gallery filter */}
            <div className="flex items-center justify-center gap-2 mb-8">
              {['TOUS', 'Plats', 'Spécialités', 'Cadre', 'Desserts'].map(cat => (
                <button
                  key={cat}
                  onClick={() => setGalleryCategory(cat)}
                  className={`px-3.5 py-1.5 text-xs font-bold rounded-full transition ${
                    galleryCategory === cat
                      ? 'bg-stone-900 text-white'
                      : 'bg-stone-200 text-stone-700 hover:bg-stone-300'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {filteredGallery.map(image => (
                <div 
                  key={image.id}
                  className={`group relative h-64 overflow-hidden shadow-sm bg-stone-200 ${cardRadiusClass}`}
                >
                  <img 
                    src={image.url || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop&q=80'} 
                    alt={image.caption}
                    className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition duration-300 flex items-end p-4">
                    <p className="text-white text-xs font-bold leading-snug">
                      {image.caption}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ====================================================================== */}
      {/* 7. OPENING HOURS & LOCATION */}
      {/* ====================================================================== */}
      {(config.sections_visibility.hours || config.sections_visibility.location) && (
        <section id="horaires" className="py-16 sm:py-24 bg-white border-y border-stone-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
              
              {/* Hours Column */}
              {config.sections_visibility.hours && (
                <div className="lg:col-span-6 space-y-6">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-orange-600">
                      Disponibilités
                    </span>
                    <h2 className="text-3xl font-black tracking-tight mt-1 text-stone-900">
                      Horaires d'Ouverture
                    </h2>
                    <p className="text-sm text-stone-600 mt-1">
                      Nous vous accueillons avec le sourire aux créneaux suivants :
                    </p>
                  </div>

                  <div className="bg-stone-50 rounded-2xl border border-stone-200 divide-y divide-stone-200 overflow-hidden">
                    {config.hours_schedule.map(schedule => {
                      const isToday = openStatus.todaySchedule?.day === schedule.day;
                      return (
                        <div 
                          key={schedule.day}
                          className={`px-5 py-3.5 flex items-center justify-between text-sm ${
                            isToday ? 'bg-orange-50/70 font-bold text-orange-950' : 'text-stone-700'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span>{schedule.day}</span>
                            {isToday && (
                              <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full bg-orange-200 text-orange-800">
                                Aujourd'hui
                              </span>
                            )}
                          </div>
                          <div>
                            {schedule.is_closed ? (
                              <span className="text-stone-600 text-xs font-semibold">Fermé</span>
                            ) : (
                              <span className="font-mono text-xs font-bold">
                                {schedule.open_time} - {schedule.close_time}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-3">
                    <Clock className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                    <div className="text-xs text-amber-900 leading-relaxed">
                      <strong>Commandes en ligne :</strong> Les commandes sont transmises directement en cuisine durant les heures d'ouverture.
                    </div>
                  </div>
                </div>
              )}

              {/* Location & Contact Column */}
              {config.sections_visibility.location && (
                <div className="lg:col-span-6 space-y-6">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-orange-600">
                      Où nous trouver
                    </span>
                    <h2 className="text-3xl font-black tracking-tight mt-1 text-stone-900">
                      Localisation & Accès
                    </h2>
                    <p className="text-sm text-stone-600 mt-1">
                      Venez nous rendre visite ou commandez pour livraison.
                    </p>
                  </div>

                  <div className="p-6 bg-stone-50 rounded-2xl border border-stone-200 space-y-4">
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-orange-600 shrink-0 mt-1" />
                      <div>
                        <div className="text-sm font-bold text-stone-900">{restaurant.name}</div>
                        <div className="text-sm text-stone-600">{config.location.address}</div>
                        <div className="text-xs text-stone-600 mt-0.5">{config.location.city || 'Dakar'}</div>
                      </div>
                    </div>

                    {config.location.directions_note && (
                      <div className="text-xs text-stone-600 pl-8">
                        📍 {config.location.directions_note}
                      </div>
                    )}

                    {config.location.google_maps_url && (
                      <div className="pt-2">
                        <a 
                          href={config.location.google_maps_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-white text-stone-800 border border-stone-300 hover:bg-stone-100 transition ${buttonRadiusClass}`}
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>Ouvrir dans Google Maps</span>
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Contact shortcuts */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <a
                      href={`tel:${config.contact.phone}`}
                      className="p-4 bg-stone-900 text-white rounded-2xl flex items-center gap-3 hover:bg-stone-800 transition"
                    >
                      <Phone className="w-5 h-5 text-orange-400" />
                      <div>
                        <div className="text-[11px] text-stone-400 font-medium">Téléphone</div>
                        <div className="text-sm font-bold">{config.contact.phone}</div>
                      </div>
                    </a>

                    {config.contact.whatsapp && (
                      <a
                        href={`https://wa.me/${config.contact.whatsapp}?text=${encodeURIComponent(`Bonjour ${restaurant.name}, je souhaiterais des informations.`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-4 bg-emerald-600 text-white rounded-2xl flex items-center gap-3 hover:bg-emerald-700 transition"
                      >
                        <MessageCircle className="w-5 h-5 text-white" />
                        <div>
                          <div className="text-[11px] text-emerald-100 font-medium">WhatsApp direct</div>
                          <div className="text-sm font-bold">Discuter en direct</div>
                        </div>
                      </a>
                    )}
                  </div>

                </div>
              )}

            </div>
          </div>
        </section>
      )}

      {/* ====================================================================== */}
      {/* 8. REVIEWS SECTION / AVIS CLIENTS */}
      {/* ====================================================================== */}
      {config.sections_visibility.reviews && (
        <section id="avis" className="py-16 sm:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mb-12">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-orange-600">
                  Témoignages
                </span>
                <h2 className="text-3xl sm:text-4xl font-black tracking-tight mt-1 text-stone-900">
                  L'Avis de Nos Clients
                </h2>
                <p className="text-sm text-stone-600 mt-1">
                  Découvrez les retours authentiques de notre communauté gourmande.
                </p>
              </div>

              <button
                onClick={() => setIsReviewModalOpen(true)}
                className={`px-5 py-2.5 text-xs font-bold text-white shadow-xs transition hover:brightness-110 ${buttonRadiusClass}`}
                style={{ backgroundColor: primaryColor }}
              >
                Laisser un Avis
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {config.reviews.filter(r => r.is_approved).map(review => (
                <div 
                  key={review.id}
                  className={`bg-white p-6 border border-stone-200 shadow-xs flex flex-col justify-between ${cardRadiusClass}`}
                >
                  <div>
                    {/* Stars */}
                    <div className="flex items-center gap-1 text-amber-500 mb-3">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={`w-4 h-4 ${i < review.rating ? 'fill-amber-400 text-amber-400' : 'text-stone-300'}`} 
                        />
                      ))}
                    </div>
                    <p className="text-stone-800 text-sm italic leading-relaxed">
                      "{review.comment}"
                    </p>
                  </div>

                  <div className="pt-4 mt-4 border-t border-stone-100 flex items-center justify-between text-xs text-stone-600">
                    <span className="font-bold text-stone-900">{review.author_name}</span>
                    <span>{review.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ====================================================================== */}
      {/* 9. RESTAURANT FOOTER (WHITE-LABEL CONTROLLED) */}
      {/* ====================================================================== */}
      <footer 
        className="py-12 border-t text-stone-600"
        style={{ backgroundColor: secondaryColor, color: '#f8fafc' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            
            {/* Restaurant Bio */}
            <div>
              <div className="text-xl font-black text-white">{restaurant.name}</div>
              <p className="text-xs text-stone-400 mt-2 max-w-sm leading-relaxed">
                {restaurant.description}
              </p>
              {config.footer.notes && (
                <p className="text-[11px] text-stone-600 mt-3">
                  {config.footer.notes}
                </p>
              )}
            </div>

            {/* Quick Links */}
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-3">
                Plan du Site
              </div>
              <ul className="space-y-1.5 text-xs text-stone-300">
                <li><a href="#specialites" className="hover:text-white transition">Spécialités</a></li>
                <li><a href="#menu" className="hover:text-white transition">La Carte</a></li>
                <li><a href="#apropos" className="hover:text-white transition">Histoire & Chef</a></li>
                <li><a href="#horaires" className="hover:text-white transition">Horaires d'Ouverture</a></li>
                <li><a href="#avis" className="hover:text-white transition">Avis Clients</a></li>
              </ul>
            </div>

            {/* Social & Contact */}
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-3">
                Nous Contacter
              </div>
              <div className="text-xs text-stone-300 space-y-1.5">
                <div>📍 {config.location.address}</div>
                <div>📞 {config.contact.phone}</div>
                <div>✉️ {config.contact.email}</div>
                {restaurant.instagram && (
                  <div className="pt-2 text-stone-400">Instagram : {restaurant.instagram}</div>
                )}
              </div>
            </div>

          </div>

          <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-400 gap-4">
            <div>
              {config.footer.custom_copyright || `© ${new Date().getFullYear()} ${restaurant.name}. Tous droits réservés.`}
            </div>

            {/* STRICT WHITE-LABEL ENFORCEMENT: ONLY SHOW IF TOGGLED TRUE */}
            {config.footer.show_powered_by_saas && (
              <div className="text-[11px] text-stone-600">
                Propulsé avec fierté par <span className="font-bold text-stone-400">RESTO QR SaaS</span>
              </div>
            )}
          </div>
        </div>
      </footer>

      {/* ====================================================================== */}
      {/* 10. FLOATING CART DRAWER */}
      {/* ====================================================================== */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div 
            className="absolute inset-0 bg-stone-900/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsCartOpen(false)}
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between">
              
              {/* Header */}
              <div className="p-6 border-b border-stone-200 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <ShoppingBag className="w-5 h-5 text-orange-600" />
                  <h3 className="text-lg font-black text-stone-900">
                    Votre Panier ({cartCount})
                  </h3>
                </div>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="p-2 text-stone-400 hover:text-stone-600 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body items */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {cart.length === 0 ? (
                  <div className="text-center py-16 text-stone-600">
                    <ShoppingBag className="w-12 h-12 text-stone-300 mx-auto mb-3" />
                    <p className="text-sm font-semibold">Votre panier est vide</p>
                    <p className="text-xs text-stone-600 mt-1">Sélectionnez des délices de la carte pour commencer.</p>
                  </div>
                ) : (
                  cart.map((item, idx) => (
                    <div key={idx} className="p-3 bg-stone-50 rounded-xl border border-stone-200 flex items-center justify-between">
                      <div className="flex-1 pr-3">
                        <div className="text-sm font-bold text-stone-900">{item.product.name}</div>
                        <div className="text-xs text-stone-600">{formatFCFA(item.product.price)} l'unité</div>
                        {item.selectedOptions.length > 0 && (
                          <div className="text-[11px] text-stone-600">
                            {item.selectedOptions.map(o => `+ ${o.name}`).join(', ')}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateCartQuantity(idx, -1)}
                          className="w-7 h-7 rounded-lg bg-white border border-stone-300 flex items-center justify-center text-stone-700 hover:bg-stone-100"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="font-bold text-sm w-5 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateCartQuantity(idx, 1)}
                          className="w-7 h-7 rounded-lg bg-white border border-stone-300 flex items-center justify-center text-stone-700 hover:bg-stone-100"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}

                {/* Promo Code Input */}
                {cart.length > 0 && (
                  <div className="pt-3">
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Code Promotionnel
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={promoCodeInput}
                        onChange={e => setPromoCodeInput(e.target.value)}
                        placeholder="Ex: BIENVENUE10"
                        className="flex-1 px-3 py-2 text-xs border border-stone-300 rounded-xl uppercase font-mono"
                      />
                      <button
                        type="button"
                        onClick={handleApplyPromo}
                        className="px-4 py-2 bg-stone-900 text-white rounded-xl text-xs font-bold hover:bg-stone-800"
                      >
                        Appliquer
                      </button>
                    </div>
                    {appliedPromo && (
                      <div className="mt-1 text-xs text-emerald-600 font-bold flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" />
                        <span>Code {appliedPromo.code} actif (-{appliedPromo.discountPercent}%)</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Checkout Form & Total */}
              {cart.length > 0 && (
                <form onSubmit={handleCheckout} className="p-6 border-t border-stone-200 bg-stone-50 space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Numéro de Table / Emplacement
                    </label>
                    <select
                      value={selectedTable}
                      onChange={e => setSelectedTable(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-stone-300 rounded-xl bg-white font-medium"
                    >
                      {tables.filter(t => t.restaurant_id === restaurant.id).map(t => (
                        <option key={t.id} value={t.name}>{t.name}</option>
                      ))}
                      <option value="À emporter">À emporter (Au comptoir)</option>
                      <option value="Livraison">Livraison à domicile</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-medium text-stone-600 mb-0.5">Votre Nom</label>
                      <input
                        type="text"
                        value={customerName}
                        onChange={e => setCustomerName(e.target.value)}
                        placeholder="Ex: Moussa"
                        className="w-full px-3 py-1.5 text-xs border border-stone-300 rounded-xl bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-stone-600 mb-0.5">Téléphone</label>
                      <input
                        type="tel"
                        value={customerPhone}
                        onChange={e => setCustomerPhone(e.target.value)}
                        placeholder="Ex: 77 123 45 67"
                        className="w-full px-3 py-1.5 text-xs border border-stone-300 rounded-xl bg-white"
                      />
                    </div>
                  </div>

                  {/* Summary */}
                  <div className="space-y-1 text-xs text-stone-600 pt-2 border-t border-stone-200">
                    <div className="flex justify-between">
                      <span>Sous-total :</span>
                      <span>{formatFCFA(cartSubtotal)}</span>
                    </div>
                    {appliedPromo && (
                      <div className="flex justify-between text-emerald-600 font-bold">
                        <span>Réduction ({appliedPromo.code}) :</span>
                        <span>-{formatFCFA(discountAmount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-base font-black text-stone-900 pt-1">
                      <span>Total à régler :</span>
                      <span>{formatFCFA(cartTotal)}</span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 text-sm font-extrabold text-white rounded-xl shadow-lg transition hover:brightness-110 active:scale-95 flex items-center justify-center gap-2"
                    style={{ backgroundColor: primaryColor }}
                  >
                    <span>Valider ma Commande</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              )}

            </div>
          </div>
        </div>
      )}

      {/* ====================================================================== */}
      {/* 11. REVIEW SUBMISSION MODAL */}
      {/* ====================================================================== */}
      {isReviewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-stone-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-stone-900">Donner votre avis</h3>
              <button 
                onClick={() => setIsReviewModalOpen(false)}
                className="text-stone-400 hover:text-stone-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Votre Nom</label>
                <input
                  type="text"
                  required
                  value={reviewAuthor}
                  onChange={e => setReviewAuthor(e.target.value)}
                  placeholder="Ex: Fatou Sow"
                  className="w-full px-4 py-2.5 text-sm border border-stone-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Note sur 5</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      className="p-1 focus:outline-hidden"
                    >
                      <Star 
                        className={`w-7 h-7 ${star <= reviewRating ? 'fill-amber-400 text-amber-400' : 'text-stone-300'}`} 
                      />
                    </button>
                  ))}
                  <span className="text-sm font-bold text-stone-700 ml-2">{reviewRating}/5</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Votre Commentaire</label>
                <textarea
                  required
                  rows={4}
                  value={reviewComment}
                  onChange={e => setReviewComment(e.target.value)}
                  placeholder="Partagez votre expérience culinaire..."
                  className="w-full px-4 py-2.5 text-sm border border-stone-300 rounded-xl"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsReviewModalOpen(false)}
                  className="flex-1 py-2.5 border border-stone-300 rounded-xl text-xs font-bold text-stone-700 hover:bg-stone-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 text-xs font-bold text-white rounded-xl shadow-md hover:brightness-110"
                  style={{ backgroundColor: primaryColor }}
                >
                  Publier l'avis
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
