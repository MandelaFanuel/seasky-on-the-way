import React from 'react';

interface SectionTitleProps {
  kicker?: string;
  title: string;
  subtitle?: string;
  centered?: boolean;
}

const SectionTitle: React.FC<SectionTitleProps> = ({ 
  kicker, 
  title, 
  subtitle, 
  centered = false 
}) => {
  return (
    <div className={`${centered ? 'text-center' : 'text-left'} mb-16`}>
      {kicker && (
        <p className="text-sm font-semibold uppercase tracking-wider text-emerald-600 mb-4">
          {kicker}
        </p>
      )}
      <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif text-gray-900 mb-6 leading-tight">
        {title}
      </h2>
      {subtitle && (
        <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
          {subtitle}
        </p>
      )}
    </div>
  );
};

export default SectionTitle;