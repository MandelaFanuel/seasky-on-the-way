// ========================= src/components/sections/product/pages/Products.tsx =========================
import React, { useEffect, useRef, useState } from "react";
import { useCart } from "../product/CartContext";
import Navigation from "../../layout/Navigation";
import Footer from "../../sections/Footer";
import { Link } from "react-router-dom";
import SeaSkyMilkTitleCard from "../../sections/shared/SeaSkyMilkTitleCard";

// ✅ IMPORTANT (Vite + Vercel):
// Assets dans /public => on utilise des URLs absolues (pas d'import depuis public)
const img1 = "/images/seasky1.webp";
const img2 = "/images/seasky2.webp";
const img3 = "/images/seasky3.webp";
const img4 = "/images/seasky11.webp";
const img5 = "/images/seasky5.webp";
const img6 = "/images/seasky9.webp";
const img7 = "/images/seasky7.webp";
const img8 = "/images/seasky8.webp";
const house = "/images/House.jpg";

// ---------------------- Icônes ----------------------
const HeartIcon: React.FC<{ className?: string }> = ({ className = "" }) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden>
    <path
      d="M12.001 21s-6.716-4.7-9.178-8.2C1.208 10.36 1.5 7.9 3.31 6.28 5.12 4.66 7.86 4.77 9.57 6.38L12 8.68l2.43-2.3c1.71-1.61 4.45-1.72 6.26-.1 1.81 1.62 2.1 4.08.49 6.52C18.72 16.3 12.001 21 12.001 21z"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinejoin="round"
    />
  </svg>
);

const StarIcon: React.FC<{ className?: string; filled?: boolean }> = ({ className = "", filled = true }) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden>
    <path
      d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
      fill={filled ? "currentColor" : "none"}
      stroke={filled ? "none" : "currentColor"}
    />
  </svg>
);

// ---------------------- Types ----------------------
type ProductType = "tous" | "lait" | "yaourt" | "fromage" | "beurre" | "creme";
type PriceRange = "tous" | "moins-2000" | "2000-3000" | "plus-3000";
type Rating = "tous" | "4-etoiles" | "3-etoiles";
type Availability = "tous" | "en-stock" | "hors-stock";
type Promotion = "tous" | "en-promotion";

interface Product {
  id: number;
  name: string;
  subtitle: string;
  price: number;
  image: string;
  type: ProductType;
  rating: number;
  inStock: boolean;
  onSale: boolean;
  bulkDiscount: boolean;
}

// ---------------------- Données ----------------------
const PRODUCT_LIST: Product[] = [
  { id: 1, name: "Lait Frais Entier", subtitle: "Lait cru réfrigéré, produit localement", price: 1500, image: img1, type: "lait", rating: 4.5, inStock: true, onSale: true, bulkDiscount: true },
  { id: 2, name: "Lait Pasteurisé", subtitle: "Pasteurisation naturelle, sans conservateurs", price: 1800, image: img2, type: "lait", rating: 4.2, inStock: true, onSale: false, bulkDiscount: true },
  { id: 3, name: "Yaourt Nature", subtitle: "Yaourt crémeux, fermentation naturelle", price: 1200, image: img3, type: "yaourt", rating: 4.7, inStock: true, onSale: true, bulkDiscount: true },
  { id: 4, name: "Fromage Blanc", subtitle: "Fromage frais, texture onctueuse", price: 2500, image: img4, type: "fromage", rating: 4.0, inStock: true, onSale: false, bulkDiscount: false },
  { id: 5, name: "Beurre Traditionnel", subtitle: "Beurre 100% naturel, fait main", price: 3000, image: img5, type: "beurre", rating: 4.8, inStock: false, onSale: true, bulkDiscount: true },
  { id: 6, name: "Lait Caillé", subtitle: "Spécialité locale, goût authentique", price: 1000, image: img6, type: "lait", rating: 3.8, inStock: true, onSale: false, bulkDiscount: false },
  { id: 7, name: "Crème Fraîche", subtitle: "Crème épaisse, parfaite pour cuisine", price: 2200, image: img7, type: "creme", rating: 4.3, inStock: true, onSale: true, bulkDiscount: true },
  { id: 8, name: "Lait en Poudre", subtitle: "Pratique pour conservation longue durée", price: 5000, image: img8, type: "lait", rating: 4.1, inStock: true, onSale: false, bulkDiscount: true },
];

// ---------------------- Utilitaires ----------------------
function useOutsideClose(ref: React.RefObject<HTMLElement>, onClose: () => void) {
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    function esc(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("mousedown", handler);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("keydown", esc);
    };
  }, [ref, onClose]);
}

// Normalisation pour recherche (accents/majuscules)
const normalize = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

// ---------------------- Filtres ----------------------
const FilterDropdown: React.FC<{
  label: string;
  options: ReadonlyArray<{ value: string; label: string }>;
  selected: string;
  onSelect: (value: string) => void;
}> = ({ label, options, selected, onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const popRef = useRef<HTMLDivElement>(null);
  useOutsideClose(popRef, () => setIsOpen(false));

  return (
    <div className="relative" ref={popRef}>
      <button
        type="button"
        className="whitespace-nowrap rounded-full border border-gray-200 bg-white px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-black/10 flex items-center gap-1 transition-colors duration-200"
        onClick={() => setIsOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        {label}
        <span className="inline-block align-middle transition-transform duration-200">{isOpen ? "▴" : "▾"}</span>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-20 animate-fadeIn">
          {options.map((option) => (
            <button
              key={option.value}
              className={`block w-full text-left px-4 py-2 text-sm transition-colors duration-150 ${
                selected === option.value ? "bg-blue-50 text-blue-700 font-medium" : "text-gray-700 hover:bg-gray-50"
              }`}
              onClick={() => {
                onSelect(option.value);
                setIsOpen(false);
              }}
              role="option"
              aria-selected={selected === option.value}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const SortDropdown: React.FC<{
  options: ReadonlyArray<{ value: string; label: string }>;
  selected: string;
  onSelect: (value: string) => void;
}> = ({ options, selected, onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const popRef = useRef<HTMLDivElement>(null);
  useOutsideClose(popRef, () => setIsOpen(false));

  const selectedLabel = options.find((opt) => opt.value === selected)?.label || "Trier par";

  return (
    <div className="relative" ref={popRef}>
      <button
        className="inline-flex items-center justify-between gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-black/10 transition-colors duration-200 min-w-[140px]"
        onClick={() => setIsOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className="truncate">{selectedLabel}</span>
        <span className="text-gray-400 transition-transform duration-200">{isOpen ? "▴" : "▾"}</span>
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-20 animate-fadeIn">
          {options.map((option) => (
            <button
              key={option.value}
              className={`block w-full text-left px-4 py-2 text-sm transition-colors duration-150 ${
                selected === option.value ? "bg-blue-50 text-blue-700 font-medium" : "text-gray-700 hover:bg-gray-50"
              }`}
              onClick={() => {
                onSelect(option.value);
                setIsOpen(false);
              }}
              role="option"
              aria-selected={selected === option.value}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// ---------------------- Carte produit ----------------------
const ProductCard: React.FC<{
  product: Product;
  onAddToCart: (product: Product, quantity: number) => void;
  showBulkOption?: boolean;
}> = ({ product, onAddToCart, showBulkOption = false }) => {
  const [quantity, setQuantity] = useState(30);

  return (
    <article className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-4 transition-colors hover:border-gray-200 hover:shadow-lg focus-within:shadow-lg">
      {product.onSale && (
        <div className="absolute left-3 top-3 bg-red-500 text-white text-[10px] sm:text-xs font-semibold px-2 py-1 rounded-full z-10">
          PROMO
        </div>
      )}
      <button
        aria-label="Ajouter aux favoris"
        className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-gray-600 shadow-sm transition hover:text-red-500"
      >
        <HeartIcon className="h-4 w-4" />
      </button>

      <div className="flex items-center justify-center h-44 sm:h-48">
        <img
          src={product.image}
          alt={product.name}
          className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-[1.02]"
          loading="lazy"
        />
      </div>

      <div className="mt-3 flex items-start justify-between gap-2">
        <h4 className="text-sm sm:text-base font-medium leading-5 text-gray-900">{product.name}</h4>
        <div className="flex flex-col items-end">
          {product.onSale ? (
            <>
              <span className="text-sm font-semibold text-red-600">{Math.round(product.price * 0.8)} FBu</span>
              <span className="text-xs text-gray-500 line-through">{product.price} FBu</span>
            </>
          ) : (
            <span className="text-sm font-semibold text-gray-900">{product.price} FBu</span>
          )}
        </div>
      </div>

      <p className="mt-1 line-clamp-2 text-xs text-gray-500">{product.subtitle}</p>

      <div className="mt-2 flex items-center gap-1 text-yellow-400">
        {Array.from({ length: 5 }).map((_, i) => (
          <StarIcon key={i} className="h-4 w-4" filled={i < Math.floor(product.rating)} />
        ))}
        <span className="ml-1 text-xs text-gray-500">({product.rating})</span>
      </div>

      {!product.inStock && <div className="mt-2 text-xs text-red-600 font-medium">Rupture de stock</div>}

      {showBulkOption && product.bulkDiscount && (
        <div className="mt-2 bg-green-50 border border-green-200 rounded-lg p-2">
          <p className="text-xs text-green-800 font-semibold">✓ Éligible à la remise en gros</p>
          <p className="text-xs text-green-600">-20% pour 30+ pièces</p>
        </div>
      )}

      <div className="mt-3 flex gap-2">
        {!showBulkOption ? (
          <>
            <button
              onClick={() => onAddToCart(product, 1)}
              disabled={!product.inStock}
              className={`flex-1 rounded-full border border-gray-300 px-3 py-2 sm:px-4 sm:py-2 text-sm font-medium transition ${
                product.inStock ? "bg-white text-gray-700 hover:bg-gray-50" : "bg-gray-100 text-gray-400 cursor-not-allowed"
              }`}
            >
              {product.inStock ? "Ajouter au panier" : "Rupture de stock"}
            </button>
            <button
              onClick={() => onAddToCart(product, 30)}
              disabled={!product.inStock || !product.bulkDiscount}
              className={`rounded-full border px-3 py-2 sm:px-4 sm:py-2 text-sm font-medium transition ${
                product.inStock && product.bulkDiscount
                  ? "border-[#0B568C] bg-[#0B568C] text-white hover:bg-[#1A4F75]"
                  : "border-gray-300 bg-gray-100 text-gray-400 cursor-not-allowed"
              }`}
            >
              Gros
            </button>
          </>
        ) : (
          <div className="w-full">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-700">Quantité:</span>
              <div className="flex items-center gap-2">
                <button onClick={() => setQuantity((q) => Math.max(30, q - 1))} className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center" aria-label="Diminuer la quantité">
                  -
                </button>
                <span className="w-8 text-center" aria-live="polite">
                  {quantity}
                </span>
                <button onClick={() => setQuantity((q) => q + 1)} className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center" aria-label="Augmenter la quantité">
                  +
                </button>
              </div>
            </div>
            <button
              onClick={() => onAddToCart(product, quantity)}
              disabled={!product.inStock}
              className="w-full rounded-full bg-[#0B568C] border border-[#0B568C] px-4 py-2 text-sm font-medium text-white hover:bg-[#1A4F75] transition disabled:bg-gray-300 disabled:border-gray-300 disabled:cursor-not-allowed"
            >
              Acheter en gros ({quantity} pièces)
            </button>
          </div>
        )}
      </div>
    </article>
  );
};

// ---------------------- Page Produits ----------------------
const Products: React.FC = () => {
  const { addToCart } = useCart();
  const [filters, setFilters] = useState({
    type: "tous" as ProductType,
    price: "tous" as PriceRange,
    rating: "tous" as Rating,
    availability: "tous" as Availability,
    promotion: "tous" as Promotion,
  });
  const [sortBy, setSortBy] = useState("nom-asc");
  const [showBulkOnly, setShowBulkOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const productsRef = useRef<HTMLDivElement>(null);

  const handleAddToCart = (product: Product, quantity: number) => {
    const unitPrice = product.onSale ? product.price * 0.8 : product.price;
    const finalPrice = quantity >= 30 && product.bulkDiscount ? unitPrice * 0.8 : unitPrice;
    addToCart(product.id, product.name, Math.round(finalPrice), product.image, quantity);
  };

  const filteredProducts = PRODUCT_LIST.filter((product) => {
    const q = normalize(searchQuery);
    if (q && !normalize(product.name).includes(q) && !normalize(product.subtitle).includes(q)) return false;

    if (filters.type !== "tous" && product.type !== filters.type) return false;

    if (filters.price !== "tous") {
      if (filters.price === "moins-2000" && product.price >= 2000) return false;
      if (filters.price === "2000-3000" && (product.price < 2000 || product.price > 3000)) return false;
      if (filters.price === "plus-3000" && product.price <= 3000) return false;
    }

    if (filters.rating !== "tous") {
      if (filters.rating === "4-etoiles" && product.rating < 4) return false;
      if (filters.rating === "3-etoiles" && product.rating >= 4) return false;
    }

    if (filters.availability !== "tous") {
      if (filters.availability === "en-stock" && !product.inStock) return false;
      if (filters.availability === "hors-stock" && product.inStock) return false;
    }

    if (filters.promotion !== "tous") {
      if (filters.promotion === "en-promotion" && !product.onSale) return false;
    }

    if (showBulkOnly && !product.bulkDiscount) return false;

    return true;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case "prix-asc":
        return a.price - b.price;
      case "prix-desc":
        return b.price - a.price;
      case "nom-asc":
        return a.name.localeCompare(b.name);
      case "nom-desc":
        return b.name.localeCompare(a.name);
      case "rating-desc":
        return b.rating - a.rating;
      default:
        return 0;
    }
  });

  const filterOptions = {
    type: [
      { value: "tous", label: "Tous les types" },
      { value: "lait", label: "Lait" },
      { value: "yaourt", label: "Yaourt" },
      { value: "fromage", label: "Fromage" },
      { value: "beurre", label: "Beurre" },
      { value: "creme", label: "Crème" },
    ],
    price: [
      { value: "tous", label: "Tous les prix" },
      { value: "moins-2000", label: "Moins de 2000 FBu" },
      { value: "2000-3000", label: "2000 - 3000 FBu" },
      { value: "plus-3000", label: "Plus de 3000 FBu" },
    ],
    rating: [
      { value: "tous", label: "Toutes les évaluations" },
      { value: "4-etoiles", label: "4 étoiles et plus" },
      { value: "3-etoiles", label: "3 étoiles et moins" },
    ],
    availability: [
      { value: "tous", label: "Tous les statuts" },
      { value: "en-stock", label: "En stock" },
      { value: "hors-stock", label: "Rupture de stock" },
    ],
    promotion: [
      { value: "tous", label: "Avec et sans promo" },
      { value: "en-promotion", label: "En promotion seulement" },
    ],
  } as const;

  const sortOptions = [
    { value: "nom-asc", label: "Nom (A-Z)" },
    { value: "nom-desc", label: "Nom (Z-A)" },
    { value: "prix-asc", label: "Prix (Croissant)" },
    { value: "prix-desc", label: "Prix (Décroissant)" },
    { value: "rating-desc", label: "Meilleures notes" },
  ];

  const scrollToProducts = () => {
    productsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <Navigation />

      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-6 mt-20">
        {/* ==================== Bandeau titre style HERO (réutilisable) ==================== */}
        <div className="mt-2 mb-6">
          <SeaSkyMilkTitleCard variant="page" align="left" />
        </div>

        {/* ---------------- Bandeau Promo ---------------- */}
        <section aria-label="Promotion jusqu'à 50% sur produits laitiers" className="mt-6 overflow-hidden rounded-2xl bg-[#e4f4fd]">
          <div className="grid grid-cols-1 md:grid-cols-2 items-stretch gap-6 p-5 sm:p-6 md:p-8">
            {/* Colonne texte */}
            <div className="order-2 md:order-1 flex flex-col justify-center">
              <h2 className="font-semibold text-gray-900 leading-tight text-[clamp(1.25rem,4.5vw,2.5rem)]">
                Jusqu'à 50% de réduction sur nos produits laitiers sélectionnés
              </h2>

              <p className="mt-3 text-sm sm:text-base text-gray-700 max-w-prose">
                Profitez d'offres limitées sur nos laits, yaourts, fromages et crèmes. Livraison rapide dans tout le Burundi.
              </p>

              <div className="mt-5 sm:mt-6 flex flex-col xs:flex-row sm:flex-row gap-3 sm:gap-4 w-full">
                <button
                  onClick={scrollToProducts}
                  className="w-full xs:w-auto sm:w-auto inline-flex items-center justify-center bg-[#0B568C] text-white px-5 py-3 rounded-xl font-semibold hover:bg-[#1A4F75] transition-colors text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-[#0B568C]/30"
                >
                  Acheter maintenant
                </button>

                <button
                  onClick={() => setShowBulkOnly((v) => !v)}
                  className={`w-full xs:w-auto sm:w-auto inline-flex items-center justify-center px-5 py-3 rounded-xl font-semibold transition-colors text-sm sm:text-base border-2 focus:outline-none focus:ring-2 focus:ring-[#0B568C]/20 ${
                    showBulkOnly
                      ? "bg-[#0B568C] text-white border-[#0B568C]"
                      : "bg-transparent text-[#0B568C] border-[#0B568C] hover:bg-[#0B568C] hover:text-white"
                  }`}
                >
                  {showBulkOnly ? "Voir tous les produits" : "Achat en gros"}
                </button>
              </div>

              {/* Badges secondaires */}
              <div className="mt-4 flex flex-wrap gap-2 text-xs text-gray-600">
                <span className="rounded-full bg-white/70 px-3 py-1">-20% dès 30 pièces</span>
                <span className="rounded-full bg-white/70 px-3 py-1">Qualité locale</span>
                <span className="rounded-full bg-white/70 px-3 py-1">Livraison rapide</span>
              </div>
            </div>

            {/* Colonne image */}
            <div className="order-1 md:order-2 flex items-center justify-center">
              <div className="relative w-full max-w-[640px] aspect-16/10 sm:aspect-video overflow-hidden rounded-2xl">
                <img src={house} alt="Siège Principal SeaSky Lait - Bujumbura, Burundi" className="absolute inset-0 h-full w-full object-cover will-change-transform" loading="eager" />
              </div>
            </div>
          </div>
        </section>

        {/* ---------------- Filtres, recherche & tri ---------------- */}
        <div ref={productsRef} className="mt-6 flex flex-col items-stretch justify-between gap-4 sm:flex-row">
          <div className="flex flex-wrap gap-2">
            <FilterDropdown label="Type de produit" options={filterOptions.type} selected={filters.type} onSelect={(value) => setFilters({ ...filters, type: value as ProductType })} />
            <FilterDropdown label="Prix" options={filterOptions.price} selected={filters.price} onSelect={(value) => setFilters({ ...filters, price: value as PriceRange })} />
            <FilterDropdown label="Évaluation" options={filterOptions.rating} selected={filters.rating} onSelect={(value) => setFilters({ ...filters, rating: value as Rating })} />
            <FilterDropdown label="Disponibilité" options={filterOptions.availability} selected={filters.availability} onSelect={(value) => setFilters({ ...filters, availability: value as Availability })} />
            <FilterDropdown label="Promotions" options={filterOptions.promotion} selected={filters.promotion} onSelect={(value) => setFilters({ ...filters, promotion: value as Promotion })} />
          </div>

          {/* Recherche + compteur + tri */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 mt-2 sm:mt-0 w-full sm:w-auto">
            {/* Barre de recherche temps réel */}
            <div className="relative w-full sm:w-72">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher un produit (gros ou détail)..."
                aria-label="Rechercher un produit"
                className="w-full rounded-full border border-gray-200 bg-white py-2.5 pl-10 pr-10 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0B568C]/20"
              />
              <svg className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-4.35-4.35M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15z" />
              </svg>
              {searchQuery && (
                <button type="button" onClick={() => setSearchQuery("")} aria-label="Effacer la recherche" className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-gray-400 hover:text-gray-600">
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600 whitespace-nowrap">
                {sortedProducts.length} produit{sortedProducts.length !== 1 ? "s" : ""}
              </span>
              <SortDropdown options={sortOptions} selected={sortBy} onSelect={setSortBy} />
            </div>
          </div>
        </div>

        {/* ---------------- Titre Section ---------------- */}
        <h3 className="mt-6 text-lg sm:text-xl font-semibold text-gray-900">
          {showBulkOnly ? "Produits disponibles en gros (30+ pièces)" : "Nos Produits Laitiers"}
        </h3>

        {/* ---------------- Grille produits ---------------- */}
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {sortedProducts.map((product) => (
            <ProductCard key={product.id} product={product} onAddToCart={handleAddToCart} showBulkOption={showBulkOnly} />
          ))}
        </div>

        {sortedProducts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">Aucun produit ne correspond à vos critères de filtrage.</p>
            <button
              onClick={() => {
                setFilters({ type: "tous", price: "tous", rating: "tous", availability: "tous", promotion: "tous" });
                setShowBulkOnly(false);
                setSearchQuery("");
              }}
              className="mt-4 text-[#0B568C] hover:text-[#1A4F75] underline"
            >
              Réinitialiser les filtres
            </button>
          </div>
        )}

        {/* ---------------- Section Devenir Livreur ---------------- */}
        <section className="mt-16 mb-12 bg-linear-to-r from-[#5c9bb3] to-[#1A4F75] rounded-2xl p-6 sm:p-8 text-white">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-xl sm:text-2xl font-bold mb-4">Devenez Livreur SeaSky</h3>
              <p className="mb-6 text-sm sm:text-base">
                Rejoignez notre équipe de livreurs et participez à la distribution de produits laitiers de qualité dans tout le Burundi. Revenus stables et horaires flexibles.
              </p>
              <div className="space-y-3 mb-6 text-sm">
                <div className="flex items-center">
                  <svg className="h-5 w-5 text-green-300 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Revenus compétitifs et paiements réguliers</span>
                </div>
                <div className="flex items-center">
                  <svg className="h-5 w-5 text-green-300 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Horaires flexibles adaptés à votre emploi du temps</span>
                </div>
                <div className="flex items-center">
                  <svg className="h-5 w-5 text-green-300 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Formation fournie et équipement de livraison</span>
                </div>
              </div>
              <Link
                to="/register?role=livreur"
                className="inline-flex items-center bg-white text-[#0B568C] px-6 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-colors"
              >
                Postuler maintenant
                <svg className="ml-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
            <div className="flex justify-center">
              <div className="bg-white/20 rounded-2xl p-6 border border-white/30 max-w-sm w-full">
                <svg className="h-16 w-16 text-white mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <p className="text-center text-white/90 text-sm">Rejoignez une communauté de plus de 50 livreurs qui font confiance à SeaSky</p>
              </div>
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
};

export default Products;
