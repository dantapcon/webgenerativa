'use client';

import Link from 'next/link';
import { useState } from 'react';
import { generateSlug } from '@/lib/utils';

interface NavigationBarProps {
  categorias: Array<{
    id: number;
    nombre: string;
  }>;
  empresaSlug: string;
  colorPrimario?: string | null;
  tipografia?: string | null;
  categoriaActiva?: string; // Slug de la categoría activa
}

export function NavigationBar({ 
  categorias, 
  empresaSlug, 
  colorPrimario, 
  tipografia,
  categoriaActiva 
}: NavigationBarProps) {
  const [hoveredItem, setHoveredItem] = useState<number | null>(null);

  return (
    <nav className="bg-white border-b shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-center py-4">
          <div className="flex flex-wrap items-center justify-center gap-2 lg:gap-4">
            {categorias.map((categoria) => {
              const categorySlug = generateSlug(categoria.nombre);
              const isHovered = hoveredItem === categoria.id;
              const isActive = categoriaActiva === categorySlug;
              
              return (
                <Link
                  key={categoria.id}
                  href={`/${empresaSlug}/${categorySlug}`}
                  className="group relative px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:text-white hover:shadow-xl hover:-translate-y-1 transform"
                  style={{ 
                    fontFamily: `'${tipografia}', sans-serif`,
                    backgroundColor: (isActive || isHovered) ? colorPrimario || '#2563eb' : '#f8fafc',
                    color: (isActive || isHovered) ? 'white' : '#374151',
                    transform: (isActive || isHovered) ? 'translateY(-4px)' : 'translateY(0)',
                    boxShadow: isActive ? `0 10px 25px ${colorPrimario || '#2563eb'}30` : undefined
                  }}
                  onMouseEnter={() => !isActive && setHoveredItem(categoria.id)}
                  onMouseLeave={() => setHoveredItem(null)}
                >
                  <span className="relative z-10">{categoria.nombre}</span>
                  {isActive && (
                    <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-2 h-2 rounded-full" style={{ backgroundColor: colorPrimario || '#2563eb' }}></div>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
