import React from 'react';

interface FilterOptions {
  category: string;
  priceRange: string;
  sortBy: string;
  searchQuery: string;
}

interface ProductFiltersProps {
  activeFilter: FilterOptions;
  onFilterChange: (filterType: keyof FilterOptions, value: string) => void;
  categories: string[];
  isWholesale?: boolean;
}

const ProductFilters: React.FC<ProductFiltersProps> = ({
  activeFilter,
  onFilterChange,
  categories,
  isWholesale = false
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 mb-8">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        {/* Search Bar */}
        <div className="flex-1 max-w-md">
          <div className="relative">
            <input
              type="text"
              placeholder={`Rechercher ${isWholesale ? 'en gros' : 'en détail'}...`}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-12"
              value={activeFilter.searchQuery}
              onChange={(e) => onFilterChange('searchQuery', e.target.value)}
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4">
          <select 
            className="px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            value={activeFilter.category}
            onChange={(e) => onFilterChange('category', e.target.value)}
          >
            <option value="all">Toutes catégories</option>
            {categories.map(category => (
              <option key={category} value={category}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </option>
            ))}
          </select>
          
          <select 
            className="px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            value={activeFilter.priceRange}
            onChange={(e) => onFilterChange('priceRange', e.target.value)}
          >
            <option value="all">Tous prix</option>
            {isWholesale ? (
              <>
                <option value="0-1000">Moins de 1,000 BIF</option>
                <option value="1000-2000">1,000 - 2,000 BIF</option>
                <option value="2000-3000">2,000 - 3,000 BIF</option>
                <option value="3000">Plus de 3,000 BIF</option>
              </>
            ) : (
              <>
                <option value="0-1500">Moins de 1,500 BIF</option>
                <option value="1500-2500">1,500 - 2,500 BIF</option>
                <option value="2500-3500">2,500 - 3,500 BIF</option>
                <option value="3500">Plus de 3,500 BIF</option>
              </>
            )}
          </select>

          <select 
            className="px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            value={activeFilter.sortBy}
            onChange={(e) => onFilterChange('sortBy', e.target.value)}
          >
            <option value="default">Trier par</option>
            <option value="price-asc">Prix croissant</option>
            <option value="price-desc">Prix décroissant</option>
            <option value="rating">Meilleures notes</option>
            <option value="name">Ordre alphabétique</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default ProductFilters;