// Sistema de Cache para WebGenerator Pro
// Manejo de cache en memoria con TTL y invalidación inteligente

type CacheKey = string;
type CacheValue = any;
type TTL = number; // Time to live en milisegundos

interface CacheEntry {
  data: CacheValue;
  timestamp: number;
  ttl: number;
  tags: string[];
}

interface CacheStats {
  hits: number;
  misses: number;
  sets: number;
  invalidations: number;
  memoryUsage: number;
}

class MemoryCache {
  private cache = new Map<CacheKey, CacheEntry>();
  private stats: CacheStats = {
    hits: 0,
    misses: 0,
    sets: 0,
    invalidations: 0,
    memoryUsage: 0
  };

  constructor() {
    // Limpiar cache expirado cada 5 minutos
    setInterval(() => this.cleanExpired(), 5 * 60 * 1000);
  }

  /**
   * Obtener valor del cache
   */
  get(key: CacheKey): CacheValue | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      this.stats.misses++;
      return null;
    }

    // Verificar si ha expirado
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      this.stats.misses++;
      return null;
    }

    this.stats.hits++;
    return entry.data;
  }

  /**
   * Guardar valor en cache
   */
  set(key: CacheKey, data: CacheValue, ttl: TTL = 5 * 60 * 1000, tags: string[] = []): void {
    const entry: CacheEntry = {
      data,
      timestamp: Date.now(),
      ttl,
      tags
    };

    this.cache.set(key, entry);
    this.stats.sets++;
    this.updateMemoryUsage();
  }

  /**
   * Invalidar cache por clave
   */
  delete(key: CacheKey): boolean {
    const deleted = this.cache.delete(key);
    if (deleted) {
      this.stats.invalidations++;
      this.updateMemoryUsage();
    }
    return deleted;
  }

  /**
   * Invalidar cache por tags
   */
  invalidateByTags(tags: string[]): number {
    let invalidated = 0;
    
    for (const [key, entry] of this.cache.entries()) {
      if (entry.tags.some(tag => tags.includes(tag))) {
        this.cache.delete(key);
        invalidated++;
      }
    }
    
    this.stats.invalidations += invalidated;
    this.updateMemoryUsage();
    return invalidated;
  }

  /**
   * Limpiar cache expirado
   */
  private cleanExpired(): void {
    const now = Date.now();
    let cleaned = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      console.log(`🧹 Cache: Limpiadas ${cleaned} entradas expiradas`);
      this.updateMemoryUsage();
    }
  }

  /**
   * Actualizar estadísticas de memoria
   */
  private updateMemoryUsage(): void {
    this.stats.memoryUsage = this.cache.size;
  }

  /**
   * Limpiar todo el cache
   */
  clear(): void {
    this.cache.clear();
    this.stats.invalidations += this.stats.memoryUsage;
    this.updateMemoryUsage();
  }

  /**
   * Obtener estadísticas del cache
   */
  getStats(): CacheStats & { hitRate: number } {
    const total = this.stats.hits + this.stats.misses;
    const hitRate = total > 0 ? (this.stats.hits / total) * 100 : 0;
    
    return {
      ...this.stats,
      hitRate: Math.round(hitRate * 100) / 100
    };
  }

  /**
   * Obtener información de debug
   */
  getDebugInfo(): { keys: string[], size: number, stats: CacheStats & { hitRate: number } } {
    return {
      keys: Array.from(this.cache.keys()),
      size: this.cache.size,
      stats: this.getStats()
    };
  }
}

// Instancia singleton del cache
const memoryCache = new MemoryCache();

// Configuraciones de TTL por tipo de dato
export const CacheTTL = {
  // Datos que cambian raramente
  EMPRESA_BASIC: 15 * 60 * 1000,      // 15 minutos
  CATEGORIAS: 10 * 60 * 1000,         // 10 minutos
  COLORIMETRIA: 20 * 60 * 1000,       // 20 minutos
  VENTANA_FLOTANTE: 5 * 60 * 1000,    // 5 minutos
  
  // Datos que pueden cambiar más frecuentemente
  PRODUCTOS: 5 * 60 * 1000,           // 5 minutos
  SERVICIOS: 5 * 60 * 1000,           // 5 minutos
  SUCURSALES: 10 * 60 * 1000,         // 10 minutos
  
  // Datos muy dinámicos
  EMPRESA_COMPLETE: 3 * 60 * 1000,    // 3 minutos
  
  // Desarrollo (TTLs más cortos)
  DEV_SHORT: 30 * 1000,               // 30 segundos
  DEV_MEDIUM: 2 * 60 * 1000,          // 2 minutos
} as const;

// Tags para invalidación inteligente
export const CacheTags = {
  empresa: (empresaId: number) => `empresa:${empresaId}`,
  categoria: (empresaId: number) => `categoria:${empresaId}`,
  producto: (empresaId: number) => `producto:${empresaId}`,
  servicio: (empresaId: number) => `servicio:${empresaId}`,
  colorimetria: (empresaId: number) => `colorimetria:${empresaId}`,
  ventanaFlotante: (empresaId: number) => `ventana:${empresaId}`,
  sucursal: (empresaId: number) => `sucursal:${empresaId}`,
  slug: (slug: string) => `slug:${slug}`,
} as const;

// Generadores de claves de cache
export const CacheKeys = {
  empresaBySlug: (slug: string) => `empresa:slug:${slug}`,
  empresaById: (id: number) => `empresa:id:${id}`,
  empresaBasic: (id: number) => `empresa:basic:${id}`,
  categorias: (empresaId: number) => `categorias:${empresaId}`,
  productos: (empresaId: number, categoriaId?: number, subcategoriaId?: number) => {
    let key = `productos:${empresaId}`;
    if (categoriaId) key += `:cat:${categoriaId}`;
    if (subcategoriaId) key += `:sub:${subcategoriaId}`;
    return key;
  },
  servicios: (empresaId: number, categoriaId?: number, subcategoriaId?: number) => {
    let key = `servicios:${empresaId}`;
    if (categoriaId) key += `:cat:${categoriaId}`;
    if (subcategoriaId) key += `:sub:${subcategoriaId}`;
    return key;
  },
  colorimetria: (elementoId: number, tipoElemento: string) => `colorimetria:${tipoElemento}:${elementoId}`,
  ventanaFlotante: (empresaId: number) => `ventana:${empresaId}`,
  sucursales: (empresaId: number) => `sucursales:${empresaId}`,
  navegacion: (empresaId: number) => `navegacion:${empresaId}`,
} as const;

// Clase principal del servicio de cache
export class CacheService {
  /**
   * Obtener o ejecutar función con cache
   */
  static async getOrSet<T>(
    key: CacheKey,
    fetcher: () => Promise<T>,
    ttl: TTL = CacheTTL.EMPRESA_COMPLETE,
    tags: string[] = []
  ): Promise<T> {
    // Intentar obtener del cache
    const cached = memoryCache.get(key);
    if (cached !== null) {
      return cached as T;
    }

    try {
      // Ejecutar fetcher si no está en cache
      const data = await fetcher();
      
      // Guardar en cache
      memoryCache.set(key, data, ttl, tags);
      
      return data;
    } catch (error) {
      console.error(`❌ Error en cache fetch para clave "${key}":`, error);
      throw error;
    }
  }

  /**
   * Invalidar cache por tags
   */
  static invalidate(tags: string[]): number {
    const invalidated = memoryCache.invalidateByTags(tags);
    console.log(`🗑️ Cache: Invalidadas ${invalidated} entradas por tags:`, tags);
    return invalidated;
  }

  /**
   * Invalidar cache de empresa completa
   */
  static invalidateEmpresa(empresaId: number): void {
    const tags = [
      CacheTags.empresa(empresaId),
      CacheTags.categoria(empresaId),
      CacheTags.producto(empresaId),
      CacheTags.servicio(empresaId),
      CacheTags.colorimetria(empresaId),
      CacheTags.ventanaFlotante(empresaId),
      CacheTags.sucursal(empresaId),
    ];
    
    this.invalidate(tags);
  }

  /**
   * Invalidar cache por slug
   */
  static invalidateBySlug(slug: string): void {
    const tags = [CacheTags.slug(slug)];
    this.invalidate(tags);
  }

  /**
   * Obtener estadísticas del cache
   */
  static getStats() {
    return memoryCache.getStats();
  }

  /**
   * Obtener información de debug
   */
  static getDebugInfo() {
    return memoryCache.getDebugInfo();
  }

  /**
   * Limpiar todo el cache
   */
  static clear(): void {
    memoryCache.clear();
    console.log('🧹 Cache: Limpiado completamente');
  }

  /**
   * Determinar TTL basado en el entorno
   */
  static getTTL(baseTTL: TTL): TTL {
    const isDev = process.env.NODE_ENV === 'development';
    
    // En desarrollo, usar TTLs más cortos para facilitar testing
    if (isDev) {
      return Math.min(baseTTL, CacheTTL.DEV_MEDIUM);
    }
    
    return baseTTL;
  }

  /**
   * Crear wrapper para funciones con cache automático
   */
  static withCache<T extends any[], R>(
    fn: (...args: T) => Promise<R>,
    keyGenerator: (...args: T) => string,
    ttl: TTL = CacheTTL.EMPRESA_COMPLETE,
    tagsGenerator?: (...args: T) => string[]
  ) {
    return async (...args: T): Promise<R> => {
      const key = keyGenerator(...args);
      const tags = tagsGenerator ? tagsGenerator(...args) : [];
      
      return this.getOrSet(
        key,
        () => fn(...args),
        this.getTTL(ttl),
        tags
      );
    };
  }
}

export default CacheService;