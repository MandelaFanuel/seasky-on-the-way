import React, { useState } from 'react';
import { useCart } from './CartContext';
import { Product } from './ProductCard';

interface ProductDetailModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

const ProductDetailModal: React.FC<ProductDetailModalProps> = ({ product, isOpen, onClose }) => {
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();

  if (!product || !isOpen) return null;

  const handleAddToCart = () => {
    addToCart(product.id, product.title, product.price, product.image, quantity);
    onClose();
  };

  const updateQuantity = (newQuantity: number) => {
    if (newQuantity >= 1) {
      setQuantity(newQuantity);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="relative">
          <img
            src={product.image}
            alt={product.alt}
            className="w-full h-64 object-contain rounded-t-xl bg-gray-100"
          />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 bg-white rounded-full p-2 hover:bg-gray-100 transition-colors shadow-lg"
          >
            <svg className="h-5 w-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
            <h3 className="text-2xl font-bold text-gray-900">{product.title}</h3>
            <div className="flex items-center">
              <div className="flex text-yellow-400 mr-2">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="h-5 w-5" fill={i < Math.floor(product.rating) ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.7-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                ))}
              </div>
              <span className="text-gray-600">({product.reviews} avis)</span>
            </div>
          </div>
          
          <p className="text-gray-600 mb-4 text-lg">{product.description}</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
            <div>
              <h4 className="font-semibold text-gray-800 mb-4 text-xl">Caractéristiques</h4>
              <ul className="space-y-3">
                {product.features.map((feature: string, index: number) => (
                  <li key={index} className="flex items-center text-gray-600">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-3" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-800 mb-4 text-xl">Tarifs</h4>
              <div className="bg-blue-50 rounded-xl p-4 mb-4">
                <div className="text-2xl font-bold text-blue-700 mb-2">
                  {product.price.toLocaleString()} {product.currency}
                  <span className="text-sm font-normal text-gray-600 ml-2">Détail</span>
                </div>
                <div className="text-sm text-gray-600">Prix unitaire</div>
              </div>
              
              {product.wholesalePrice && (
                <div className="bg-green-50 rounded-xl p-4">
                  <div className="text-2xl font-bold text-green-700 mb-2">
                    {product.wholesalePrice.toLocaleString()} {product.currency}
                    <span className="text-sm font-normal text-gray-600 ml-2">Gros</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    À partir de {product.minWholesaleQty} unités
                  </div>
                </div>
              )}
            </div>
          </div>

          <p className="text-gray-600 mb-6 leading-relaxed">{product.details}</p>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-gray-200">
            <div className="flex items-center space-x-4">
              <span className="text-gray-700 font-medium">Quantité:</span>
              <div className="flex items-center space-x-3">
                <button 
                  onClick={() => updateQuantity(quantity - 1)}
                  className="w-10 h-10 rounded-full bg-gray-100 text-gray-700 flex items-center justify-center hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={quantity <= 1}
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                  </svg>
                </button>
                <span className="w-12 text-center font-semibold text-gray-800 text-lg">
                  {quantity}
                </span>
                <button 
                  onClick={() => updateQuantity(quantity + 1)}
                  className="w-10 h-10 rounded-full bg-gray-100 text-gray-700 flex items-center justify-center hover:bg-gray-200 transition-colors"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m-6h6m-6 0H6" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="flex space-x-3">
              <button 
                onClick={handleAddToCart}
                className="px-8 py-3 bg-[#0B568C] text-white rounded-lg font-medium hover:bg-[#1A4F75] transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!product.inStock}
              >
                <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Ajouter au panier
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailModal;