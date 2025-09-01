'use client';

import Link from 'next/link';
import { useState } from 'react';

interface NavigationBarProps {
  categorias: Array<{
    id: number;
    nombre: string;
  }>;
  empresaSlug: string;
  colorPrimario?: string | null;
  tipografia?: string | null;
}

export function NavigationBar({ 
  categorias, 
  empresaSlug, 
  colorPrimario, 
  tipografia 
}: NavigationBarProps) {
  const [hoveredItem, setHoveredItem] = useState<number | null>(null);

  return (
    <nav className="bg-white border-b shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-center py-4">
          <div className="flex flex-wrap items-center justify-center gap-2 lg:gap-4">
            {categorias.map((categoria) => {
              const categorySlug = categoria.nombre.toLowerCase().replace(/\s+/g, '-');
              const isHovered = hoveredItem === categoria.id;
              
              return (
                <Link
                  key={categoria.id}
                  href={`/${empresaSlug}/${categorySlug}`}
                  className="group relative px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:text-white hover:shadow-xl hover:-translate-y-1 transform"
                  style={{ 
                    fontFamily: `'${tipografia}', sans-serif`,
                    backgroundColor: isHovered ? colorPrimario || '#2563eb' : '#f8fafc',
                    color: isHovered ? 'white' : '#374151',
                    transform: isHovered ? 'translateY(-4px)' : 'translateY(0)'
                  }}
                  onMouseEnter={() => setHoveredItem(categoria.id)}
                  onMouseLeave={() => setHoveredItem(null)}
                >
                  <span className="relative z-10">{categoria.nombre}</span>
                  <div 
                    className={`absolute inset-0 rounded-xl transition-opacity duration-300 ${
                      isHovered ? 'opacity-100' : 'opacity-0'
                    }`}
                    style={{ backgroundColor: colorPrimario || '#2563eb' }}
                  ></div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
