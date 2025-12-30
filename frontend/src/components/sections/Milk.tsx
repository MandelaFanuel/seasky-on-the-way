// ========================= src/components/sections/Milk.tsx =========================
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Container from "../../components/layout/Container";
import SectionTitle from "../../components/layout/SectionTitle";

interface Product {
  id: number;
  image: string;
  alt: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  features: string[];
  details: string;
}

interface Feature {
  icon: JSX.Element;
  title: string;
  description: string;
}

const Milk: React.FC = () => {
  const [pageReady, setPageReady] = useState(false);

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const navigate = useNavigate();

  const products: Product[] = useMemo(
    () => [
      {
        id: 1,
        image: "/src/assets/images/seasky1.webp",
        alt: "Lait Frais SeaSky",
        title: "Lait Frais Pasteurisé",
        description: "Lait entier frais pasteurisé, riche en nutriments essentiels",
        price: 1500,
        currency: "BIF",
        features: ["500ml", "Pasteurisation douce", "Emballage écologique"],
        details:
          "Notre lait frais pasteurisé est collecté quotidiennement et traité avec soin pour préserver toutes ses qualités nutritionnelles. Idéal pour toute la famille.",
      },
      {
        id: 2,
        image: "/src/assets/images/seasky2.webp",
        alt: "Lait Entier SeaSky",
        title: "Lait Entier UHT",
        description: "Lait entier UHT longue conservation, qualité premium",
        price: 1800,
        currency: "BIF",
        features: ["1L", "Conservation 90 jours", "Riche en calcium"],
        details:
          "Notre lait UHT premium offre une conservation prolongée sans compromis sur la qualité. Parfait pour les familles modernes.",
      },
      {
        id: 3,
        image: "/src/assets/images/seasky3.webp",
        alt: "Pack Familial SeaSky",
        title: "Pack Familial",
        description: "Pack économique de 3L de lait frais pour toute la famille",
        price: 4000,
        currency: "BIF",
        features: ["3x1L", "Économique", "Qualité garantie"],
        details:
          "Notre pack familial offre le meilleur rapport qualité-prix pour les familles nombreuses. Fraîcheur garantie.",
      },
      {
        id: 4,
        image: "/src/assets/images/seasky7.webp",
        alt: "Lait Bio SeaSky",
        title: "Lait Biologique",
        description: "Lait 100% biologique certifié, production responsable",
        price: 2200,
        currency: "BIF",
        features: ["750ml", "Certifié bio", "Production durable"],
        details:
          "Notre lait biologique provient de fermes certifiées sans pesticides ni engrais chimiques. Le choix santé par excellence.",
      },
      {
        id: 5,
        image: "/src/assets/images/seasky8.webp",
        alt: "Lait Premium SeaSky",
        title: "Lait Premium",
        description: "Sélection premium issue de fermes partenaires",
        price: 2500,
        currency: "BIF",
        features: ["1L", "Sélection premium", "Goût riche"],
        details:
          "Une sélection premium, traçable et contrôlée, pour une expérience plus riche et plus saine au quotidien.",
      },
      {
        id: 6,
        image: "/src/assets/images/seasky5.webp",
        alt: "Crème Fraîche SeaSky",
        title: "Crème Fraîche",
        description: "Crème fraîche épaisse, idéale cuisine & pâtisserie",
        price: 2300,
        currency: "BIF",
        features: ["500ml", "Texture onctueuse", "Cuisine & pâtisserie"],
        details:
          "Notre crème fraîche est produite sous contrôle strict, parfaite pour sauces, desserts et recettes traditionnelles.",
      },
      {
        id: 7,
        image: "/src/assets/images/seasky9.webp",
        alt: "Yaourt Nature SeaSky",
        title: "Yaourt Nature",
        description: "Fermentation naturelle, goût authentique",
        price: 1200,
        currency: "BIF",
        features: ["400ml", "Fermentation naturelle", "Sans additifs"],
        details:
          "Un yaourt naturel, doux et sain, pensé pour toute la famille avec une fermentation maîtrisée.",
      },
    ],
    []
  );

  const [quantities, setQuantities] = useState<number[]>(() => products.map(() => 1));

  useEffect(() => {
    // ✅ sync si products change
    setQuantities(products.map(() => 1));
  }, [products]);

  useEffect(() => {
    const t = window.setTimeout(() => setPageReady(true), 160);
    return () => window.clearTimeout(t);
  }, []);

  const features: Feature[] = [
    {
      icon: (
        <svg className="h-6 w-6 text-[#0B568C]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 11.5V14m0-2.5v-1.5a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11"
          />
        </svg>
      ),
      title: "Durabilité",
      description: "Pratiques agricoles responsables et respect de l'environnement",
    },
    {
      icon: (
        <svg className="h-6 w-6 text-[#0B568C]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
          />
        </svg>
      ),
      title: "Qualité",
      description: "Normes sanitaires strictes et contrôles qualité rigoureux",
    },
    {
      icon: (
        <svg className="h-6 w-6 text-[#0B568C]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          />
        </svg>
      ),
      title: "Santé",
      description: "Riche en nutriments essentiels pour toute la famille",
    },
  ];

  const updateQuantity = (index: number, newQuantity: number) => {
    if (newQuantity >= 1) {
      setQuantities((prev) => {
        const copy = [...prev];
        copy[index] = newQuantity;
        return copy;
      });
    }
  };

  const addToCart = (productId: number, quantity: number) => {
    // branche ton vrai panier ici si tu veux
    // eslint-disable-next-line no-console
    console.log(`Ajout au panier: Produit ${productId}, Quantité: ${quantity}`);
  };

  const openProductDetails = (product: Product) => setSelectedProduct(product);
  const closeProductDetails = () => setSelectedProduct(null);

  const orderProduct = (productId: number, quantity: number) => {
    // eslint-disable-next-line no-console
    console.log(`Commande: Produit ${productId}, Quantité: ${quantity}`);
    closeProductDetails();
  };

  const productIndex = selectedProduct ? products.findIndex((p) => p.id === selectedProduct.id) : -1;

  return (
    <section id="milk" className="py-20 bg-linear-to-b from-white to-[#E4F5FB] relative">
      {/* ✅ overlay mini loading */}
      <div
        className={`pointer-events-none absolute inset-0 z-10 flex items-center justify-center transition-all duration-500 ${
          pageReady ? "opacity-0" : "opacity-100"
        }`}
      >
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl px-6 py-4 border border-white shadow-lg">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#0B568C]" />
            <span className="text-sm text-[#0B568C] font-semibold">Chargement des produits...</span>
          </div>
        </div>
      </div>

      <Container>
        <div className={`transition-all duration-700 ${pageReady ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"}`}>
          <SectionTitle
            kicker="Nos Produits Laitiers"
            title="Excellence dans chaque goutte"
            subtitle="Découvrez notre gamme complète de produits laitiers frais et premium"
            centered
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="relative">
              {/* Galerie empilée */}
              <div className="relative">
                <div className="relative rounded-3xl overflow-hidden shadow-2xl z-30 transform rotate-1 transition-transform duration-300 hover:rotate-0">
                  <img
                    src={products[0].image}
                    alt={products[0].alt}
                    className="w-full h-[400px] object-cover cursor-pointer"
                    onClick={() => openProductDetails(products[0])}
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/30 to-transparent" />
                  <div className="absolute bottom-4 left-4 text-white">
                    <h3 className="font-semibold">{products[0].title}</h3>
                    <p className="text-sm">
                      {products[0].price.toLocaleString()} {products[0].currency}
                    </p>
                  </div>
                </div>

                <div className="absolute top-4 -left-4 w-[90%] h-[380px] rounded-3xl overflow-hidden shadow-xl z-20 transform -rotate-2 transition-transform duration-300 hover:rotate-0">
                  <img
                    src={products[1].image}
                    alt={products[1].alt}
                    className="w-full h-full object-cover cursor-pointer"
                    onClick={() => openProductDetails(products[1])}
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/20 to-transparent" />
                </div>

                <div className="absolute top-8 -left-8 w-[80%] h-[360px] rounded-3xl overflow-hidden shadow-lg z-10 transform rotate-3 transition-transform duration-300 hover:rotate-0">
                  <img
                    src={products[2].image}
                    alt={products[2].alt}
                    className="w-full h-full object-cover cursor-pointer"
                    onClick={() => openProductDetails(products[2])}
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/10 to-transparent" />
                </div>

                <div className="absolute top-12 -left-12 w-[70%] h-[340px] rounded-3xl overflow-hidden shadow-md z-0 transform -rotate-4 transition-transform duration-300 hover:rotate-0">
                  <img
                    src={products[3].image}
                    alt={products[3].alt}
                    className="w-full h-full object-cover cursor-pointer"
                    onClick={() => openProductDetails(products[3])}
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/5 to-transparent" />
                </div>
              </div>

              {/* Badge qualité */}
              <div className="absolute -top-4 -right-4 bg-white rounded-2xl shadow-xl p-4 text-center z-40">
                <div className="text-2xl font-bold text-[#0B568C]">⭐</div>
                <div className="text-xs text-[#335F7A]">Premium</div>
              </div>

              {/* Indicateur */}
              <div className="absolute -bottom-4 -right-4 bg-white rounded-full p-2 shadow-lg z-40">
                <div className="w-10 h-10 bg-[#0B568C] rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">+{products.length}</span>
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <p className="text-lg text-[#335F7A] leading-relaxed">
                Issu des meilleures fermes partenaires du Burundi, notre lait est collecté quotidiennement, réfrigéré
                immédiatement et transporté dans des conditions optimales pour préserver sa fraîcheur et ses qualités
                nutritionnelles.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {features.map((feature: Feature, index: number) => (
                  <div
                    key={index}
                    className="text-center p-6 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-[#E4F5FB] hover:border-[#27B1E4]"
                    style={{ transitionDelay: `${index * 60}ms` }}
                  >
                    <div className="w-12 h-12 bg-[#E4F5FB] rounded-full flex items-center justify-center mx-auto mb-4">
                      {feature.icon}
                    </div>
                    <h3 className="font-semibold text-[#1A4F75] mb-2">{feature.title}</h3>
                    <p className="text-sm text-[#335F7A]">{feature.description}</p>
                  </div>
                ))}
              </div>

              <div className="bg-[#E4F5FB] rounded-2xl p-6 border border-[#27B1E4]/20">
                <h4 className="font-semibold text-[#0B568C] mb-3 flex items-center">
                  <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016"
                    />
                  </svg>
                  Notre engagement qualité
                </h4>

                <ul className="space-y-2 text-sm text-[#0B568C]">
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-[#27B1E4] rounded-full mr-3" />
                    Pasteurisation douce à 72°C
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-[#27B1E4] rounded-full mr-3" />
                    Chaîne du froid respectée
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-[#27B1E4] rounded-full mr-3" />
                    Analyses microbiologiques régulières
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-[#27B1E4] rounded-full mr-3" />
                    Emballages écologiques et recyclables
                  </li>
                </ul>
              </div>

              {/* ✅ Bouton vers /products */}
              <div className="text-center">
                <button
                  onClick={() => navigate("/products")}
                  className="inline-flex items-center justify-center bg-[#0B568C] text-white px-8 py-3 rounded-xl font-semibold hover:bg-[#1A4F75] transition-colors"
                >
                  Explorer tous nos produits
                  <svg className="ml-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </Container>

      {/* Popup */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="relative">
              <img src={selectedProduct.image} alt={selectedProduct.alt} className="w-full h-64 object-cover rounded-t-3xl" />
              <button
                onClick={closeProductDetails}
                className="absolute top-4 right-4 bg-white/80 rounded-full p-2 hover:bg-white transition-colors"
              >
                <svg className="h-6 w-6 text-[#0B568C]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6">
              <h3 className="text-2xl font-bold text-[#1A4F75] mb-2">{selectedProduct.title}</h3>
              <p className="text-[#335F7A] mb-4">{selectedProduct.description}</p>

              <div className="text-2xl font-bold text-[#0B568C] mb-4">
                {selectedProduct.price.toLocaleString()} {selectedProduct.currency}
              </div>

              <p className="text-[#335F7A] mb-6">{selectedProduct.details}</p>

              <div className="mb-6">
                <h4 className="font-semibold text-[#1A4F75] mb-3">Caractéristiques</h4>
                <ul className="space-y-2">
                  {selectedProduct.features.map((feature: string, index: number) => (
                    <li key={index} className="flex items-center text-[#335F7A]">
                      <div className="w-2 h-2 bg-[#27B1E4] rounded-full mr-3" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Quantité + actions */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => updateQuantity(productIndex, quantities[productIndex] - 1)}
                    className="w-10 h-10 rounded-full bg-[#E4F5FB] text-[#0B568C] flex items-center justify-center hover:bg-[#27B1E4] hover:text-white transition-colors"
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                    </svg>
                  </button>

                  <span className="w-12 text-center font-semibold text-[#1A4F75] text-lg">
                    {quantities[productIndex]}
                  </span>

                  <button
                    onClick={() => updateQuantity(productIndex, quantities[productIndex] + 1)}
                    className="w-10 h-10 rounded-full bg-[#E4F5FB] text-[#0B568C] flex items-center justify-center hover:bg-[#27B1E4] hover:text-white transition-colors"
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </button>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={() => addToCart(selectedProduct.id, quantities[productIndex])}
                    className="w-12 h-12 bg-[#E4F5FB] rounded-full flex items-center justify-center hover:bg-[#27B1E4] transition-colors group"
                    title="Ajouter au panier"
                  >
                    <svg className="h-6 w-6 text-[#0B568C] group-hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                  </button>

                  <button
                    onClick={() => orderProduct(selectedProduct.id, quantities[productIndex])}
                    className="flex-1 bg-[#0B568C] text-white py-3 px-6 rounded-xl font-semibold hover:bg-[#1A4F75] transition-colors flex items-center justify-center"
                  >
                    <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Commander
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default Milk;
