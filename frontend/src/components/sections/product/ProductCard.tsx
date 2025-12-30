import React, { useState } from 'react';
import { useCart } from './CartContext';

export interface Product {
  id: number;
  image: string;
  alt: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  features: string[];
  details: string;
  rating: number;
  reviews: number;
  category: string;
  inStock: boolean;
  wholesalePrice?: number;
  minWholesaleQty?: number;
}

interface ProductCardProps {
  product: Product;
  isWholesale?: boolean;
  onViewDetails: (product: Product) => void;
  index: number;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, isWholesale = false, onViewDetails, index }) => {
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();

  const handleAddToCart = () => {
    addToCart(product.id, product.title, isWholesale && product.wholesalePrice ? product.wholesalePrice : product.price, product.image, quantity);
  };

  const updateQuantity = (newQuantity: number) => {
    if (newQuantity >= 1) {
      setQuantity(newQuantity);
    }
  };

  const displayPrice = isWholesale && product.wholesalePrice ? product.wholesalePrice : product.price;
  const displayText = isWholesale && product.wholesalePrice ? 'Gros' : 'Détail';

  const getDiscountTier = (qty: number) => {
    if (qty >= 50) return { discount: 25, text: '-25%' };
    if (qty >= 30) return { discount: 20, text: '-20%' };
    if (qty >= 20) return { discount: 15, text: '-15%' };
    if (qty >= 10) return { discount: 10, text: '-10%' };
    if (qty >= 5) return { discount: 5, text: '-5%' };
    return { discount: 0, text: '' };
  };

  const discount = getDiscountTier(quantity);
  const finalPrice = displayPrice * (1 - discount.discount / 100);

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden group">
      {/* Badges */}
      <div className="relative">
        {!product.inStock && (
          <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded z-10">
            Rupture
          </div>
        )}

        {discount.discount > 0 && (
          <div className="absolute top-2 right-2 bg-green-500 text-white text-xs font-semibold px-2 py-1 rounded z-10">
            {discount.text}
          </div>
        )}

        {/* Image */}
        <div 
          className="relative overflow-hidden cursor-pointer h-48 bg-gray-100"
          onClick={() => onViewDetails(product)}
        >
          <img
            src={product.image}
            alt={product.alt}
            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300 p-4"
          />
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Title */}
        <h3 
          className="text-sm font-semibold text-gray-800 mb-2 line-clamp-2 hover:text-blue-600 cursor-pointer"
          onClick={() => onViewDetails(product)}
          title={product.title}
        >
          {product.title}
        </h3>

        {/* Rating */}
        <div className="flex items-center mb-2">
          <div className="flex text-yellow-400 mr-1">
            {[...Array(5)].map((_, i) => (
              <svg key={i} className="h-3 w-3" fill={i < Math.floor(product.rating) ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 .118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            ))}
          </div>
          <span className="text-xs text-gray-500">({product.reviews})</span>
        </div>

        {/* Price */}
        <div className="mb-3">
          <div className="flex items-center gap-2 mb-1">
            <div className="text-lg font-bold text-gray-900">
              {Math.round(finalPrice).toLocaleString()} {product.currency}
            </div>
            {discount.discount > 0 && (
              <div className="text-sm text-gray-500 line-through">
                {displayPrice.toLocaleString()} {product.currency}
              </div>
            )}
          </div>
          <div className="text-xs text-gray-500 capitalize">{displayText}</div>
          
          {isWholesale && product.minWholesaleQty && (
            <div className="text-xs text-gray-500 mt-1">
              Min: {product.minWholesaleQty} unités
            </div>
          )}
        </div>

        {/* Discount Banner */}
        {discount.discount > 0 && (
          <div className="bg-blue-50 rounded-lg p-2 mb-3">
            <div className="text-xs text-blue-700 font-medium text-center">
              Économisez {discount.discount}% sur {quantity}+ unités
            </div>
          </div>
        )}

        {/* Quantity and Add to Cart */}
        <div className="flex items-center justify-between space-x-2">
          <div className="flex items-center space-x-2">
            <button 
              onClick={(e) => { e.stopPropagation(); updateQuantity(quantity - 1); }}
              className="w-7 h-7 rounded border border-gray-300 bg-white text-gray-600 flex items-center justify-center hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={quantity <= 1}
            >
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
              </svg>
            </button>
            <span className="w-8 text-center text-sm font-semibold text-gray-800">
              {quantity}
            </span>
            <button 
              onClick={(e) => { e.stopPropagation(); updateQuantity(quantity + 1); }}
              className="w-7 h-7 rounded border border-gray-300 bg-white text-gray-600 flex items-center justify-center hover:bg-gray-50 transition-colors"
            >
              <svg className="h-3 w-3" fill="none" viewBox=" 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </button>
          </div>

          <button 
            onClick={(e) => { e.stopPropagation(); handleAddToCart(); }}
            className="flex-1 bg-[#0B568C] text-white py-2 px-3 rounded-lg text-sm font-medium hover:bg-[#1A4F75] transition-all duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!product.inStock}
          >
            <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            {product.inStock ? 'Ajouter' : 'Indisponible'}
          </button>
        </div>

        {/* View Details */}
        <button 
          onClick={(e) => { e.stopPropagation(); onViewDetails(product); }}
          className="w-full text-xs text-[#27B1E4] hover:text-[#1A4F75] transition-colors text-center mt-2"
        >
          Voir détails
        </button>
      </div>
    </div>
  );
};

export default ProductCard;