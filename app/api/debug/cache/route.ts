import { NextRequest, NextResponse } from 'next/server';
import { CachedWebGeneratorService } from '@/lib/services/cached-webgenerator';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const empresaId = searchParams.get('empresaId');

    switch (action) {
      case 'metrics':
        const metrics = CachedWebGeneratorService.getCacheMetrics();
        return NextResponse.json({
          success: true,
          data: metrics
        });

      case 'clear':
        if (empresaId) {
          CachedWebGeneratorService.clearEmpresaCache(parseInt(empresaId));
          return NextResponse.json({
            success: true,
            message: `Cache limpiado para empresa ID: ${empresaId}`
          });
        } else {
          CachedWebGeneratorService.clearAllCache();
          return NextResponse.json({
            success: true,
            message: 'Todo el cache ha sido limpiado'
          });
        }

      case 'precalent':
        if (!empresaId) {
          return NextResponse.json({
            success: false,
            error: 'empresaId es requerido para precalentar cache'
          }, { status: 400 });
        }

        // Obtener empresa para precalentar por slug
        const { createClient } = await import('@supabase/supabase-js');
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        const { data: empresa } = await supabase
          .from('empresas')
          .select('slug')
          .eq('id', parseInt(empresaId))
          .single();

        if (!empresa) {
          return NextResponse.json({
            success: false,
            error: 'Empresa no encontrada'
          }, { status: 404 });
        }

        await CachedWebGeneratorService.precalentarCache(empresa.slug);
        
        return NextResponse.json({
          success: true,
          message: `Cache precalentado para empresa "${empresa.slug}"`
        });

      default:
        // Retornar métricas básicas por defecto
        const basicMetrics = CachedWebGeneratorService.getCacheMetrics();
        return NextResponse.json({
          success: true,
          data: basicMetrics,
          availableActions: [
            'metrics - obtener métricas detalladas',
            'clear - limpiar cache (opcionalmente por empresaId)',
            'precalent - precalentar cache para una empresa (requiere empresaId)'
          ]
        });
    }

  } catch (error: any) {
    console.error('Error en API de cache:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor',
      message: error.message || 'Error desconocido'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, empresaId, slug } = body;

    switch (action) {
      case 'invalidate':
        if (empresaId) {
          CachedWebGeneratorService.invalidateEmpresa(empresaId);
          return NextResponse.json({
            success: true,
            message: `Cache invalidado para empresa ID: ${empresaId}`
          });
        } else if (slug) {
          CachedWebGeneratorService.invalidateBySlug(slug);
          return NextResponse.json({
            success: true,
            message: `Cache invalidado para slug: ${slug}`
          });
        } else {
          return NextResponse.json({
            success: false,
            error: 'empresaId o slug es requerido para invalidar cache'
          }, { status: 400 });
        }

      case 'precalent':
        if (!slug) {
          return NextResponse.json({
            success: false,
            error: 'slug es requerido para precalentar cache'
          }, { status: 400 });
        }

        await CachedWebGeneratorService.precalentarCache(slug);
        
        return NextResponse.json({
          success: true,
          message: `Cache precalentado para empresa "${slug}"`
        });

      default:
        return NextResponse.json({
          success: false,
          error: 'Acción no válida',
          availableActions: ['invalidate', 'precalent']
        }, { status: 400 });
    }

  } catch (error: any) {
    console.error('Error en POST API de cache:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor',
      message: error.message || 'Error desconocido'
    }, { status: 500 });
  }
}