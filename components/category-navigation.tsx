'use client';

import Link from 'next/link';
import { useState } from 'react';

interface CategoryNavigationProps {
  categorias: Array<{
    id: number;
    nombre: string;
  }>;
  empresaSlug: string;
  categoriaActual: number;
  colorPrimario?: string | null;
  tipografia?: string | null;
}

export function CategoryNavigation({ 
  categorias, 
  empresaSlug, 
  categoriaActual, 
  colorPrimario, 
  tipografia 
}: CategoryNavigationProps) {
  const [hoveredItem, setHoveredItem] = useState<number | null>(null);

  return (
    <nav className="bg-white border-b shadow-sm sticky top-0 z-10">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-2 py-4 overflow-x-auto">
          {categorias.map((cat) => {
            const isActive = cat.id === categoriaActual;
            const isHovered = hoveredItem === cat.id;
            const categorySlug = cat.nombre.toLowerCase().replace(/\s+/g, '-');
            
            return (
              <Link
                key={cat.id}
                href={`/${empresaSlug}/${categorySlug}`}
                className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 whitespace-nowrap ${
                  isActive 
                    ? 'text-white shadow-lg' 
                    : 'text-gray-600 hover:text-white hover:shadow-md bg-gray-100 hover:scale-105'
                }`}
                style={{ 
                  backgroundColor: isActive ? colorPrimario || '#2563eb' : (isHovered && !isActive ? colorPrimario || '#2563eb' : undefined),
                  fontFamily: `'${tipografia}', sans-serif`,
                  color: (isActive || isHovered) ? 'white' : '#4B5563'
                }}
                onMouseEnter={() => !isActive && setHoveredItem(cat.id)}
                onMouseLeave={() => setHoveredItem(null)}
              >
                {cat.nombre}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
