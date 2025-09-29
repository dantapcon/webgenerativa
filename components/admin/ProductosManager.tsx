'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { 
  Package, 
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Save,
  X,
  DollarSign,
  Tag,
  Image,
  ArrowUpDown,
  Star,
  AlertCircle,
  Search,
  Filter,
  CheckCircle
} from 'lucide-react';

import { 
  Producto, 
  ProductoFormData,
  Categoria,
  Subcategoria,
  ApiResponse 
} from '@/lib/types/webgenerator';

interface ProductosManagerProps {
  empresaId: number;
  categorias?: Categoria[];
}

export default function ProductosManager({ empresaId, categorias = [] }: ProductosManagerProps) {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [categoriasInternas, setCategoriasInternas] = useState<Categoria[]>(categorias);
  const [categoriasLoaded, setCategoriasLoaded] = useState(false);
  const [loadingCategorias, setLoadingCategorias] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingProducto, setEditingProducto] = useState<Producto | null>(null);
  const [formData, setFormData] = useState<ProductoFormData>({
    empresa_id: empresaId,
    categoria_id: null,
    subcategoria_id: null,
    nombre: '',
    descripcion: '',
    precio: null,
    imagen_url: '',
    orden: 0,
    activo: true,
    descuento_prom: 0,
    promocion_activa: false
  });
  const [subcategorias, setSubcategorias] = useState<Subcategoria[]>([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [filtros, setFiltros] = useState({
    busqueda: '',
    categoria: '',
    soloActivos: false,
    soloPromociones: false
  });

  useEffect(() => {
    // Cargar categorías si no se pasan como props
    const loadCategorias = async () => {
      if (loadingCategorias) return; // Prevenir llamadas múltiples
      
      if (categorias.length > 0) {
        setCategoriasInternas(categorias);
        setCategoriasLoaded(true);
      } else if (!categoriasLoaded) {
        setLoadingCategorias(true);
        try {
          const response = await fetch(`/api/categorias?empresaId=${empresaId}`);
          const result: ApiResponse<Categoria[]> = await response.json();
          if (result.success && result.data) {
            setCategoriasInternas(result.data);
          }
          setCategoriasLoaded(true);
        } catch (error) {
          console.error('Error cargando categorías:', error);
          setCategoriasLoaded(true);
        } finally {
          setLoadingCategorias(false);
        }
      }
    };
    
    loadCategorias();
  }, [empresaId, categoriasLoaded, loadingCategorias]); // Removido 'categorias' del array de dependencias

  useEffect(() => {
    loadProductos();
  }, [empresaId, filtros]);

  useEffect(() => {
    // Actualizar subcategorías cuando cambia la categoría
    if (formData.categoria_id) {
      const categoria = categoriasInternas.find(c => c.id === formData.categoria_id);
      setSubcategorias(categoria?.subcategorias || []);
      setFormData(prev => ({ ...prev, subcategoria_id: null }));
    } else {
      setSubcategorias([]);
    }
  }, [formData.categoria_id, categoriasInternas]);

  const loadProductos = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        empresaId: empresaId.toString(),
        ...(filtros.soloActivos && { activos: 'true' }),
        ...(filtros.categoria && { categoriaId: filtros.categoria })
      });

      const response = await fetch(`/api/productos?${params}`);
      const result: ApiResponse<Producto[]> = await response.json();

      if (result.success && result.data) {
        let productosData = result.data;
        
        // Filtrar por búsqueda
        if (filtros.busqueda) {
          const busqueda = filtros.busqueda.toLowerCase();
          productosData = productosData.filter(p => 
            p.nombre.toLowerCase().includes(busqueda) ||
            (p.descripcion && p.descripcion.toLowerCase().includes(busqueda))
          );
        }

        // Filtrar por promociones
        if (filtros.soloPromociones) {
          productosData = productosData.filter(p => p.promocion_activa);
        }

        setProductos(productosData);
      } else {
        setError(result.error || 'Error al cargar productos');
      }
    } catch (error: any) {
      setError('Error al cargar productos');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const url = editingProducto 
        ? `/api/productos/${editingProducto.id}` 
        : '/api/productos';
      const method = editingProducto ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result: ApiResponse<Producto> = await response.json();

      if (result.success) {
        setSuccess(editingProducto ? 'Producto actualizado' : 'Producto creado');
        setShowForm(false);
        setEditingProducto(null);
        resetForm();
        loadProductos();
      } else {
        setError(result.error || 'Error al procesar producto');
      }
    } catch (error: any) {
      setError('Error al procesar producto');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (producto: Producto) => {
    setEditingProducto(producto);
    setFormData({
      empresa_id: producto.empresa_id,
      categoria_id: producto.categoria_id,
      subcategoria_id: producto.subcategoria_id,
      nombre: producto.nombre,
      descripcion: producto.descripcion || '',
      precio: producto.precio,
      imagen_url: producto.imagen_url || '',
      orden: producto.orden,
      activo: producto.activo,
      descuento_prom: producto.descuento_prom,
      promocion_activa: producto.promocion_activa
    });
    setShowForm(true);
  };

  const handleDelete = async (producto: Producto) => {
    if (!confirm(`¿Estás seguro de que quieres eliminar el producto "${producto.nombre}"?`)) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/productos/${producto.id}`, {
        method: 'DELETE',
      });

      const result: ApiResponse<void> = await response.json();

      if (result.success) {
        setSuccess('Producto eliminado exitosamente');
        loadProductos();
      } else {
        setError(result.error || 'Error al eliminar producto');
      }
    } catch (error: any) {
      setError('Error al eliminar producto');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const toggleActivo = async (producto: Producto) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/productos/${producto.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          activo: !producto.activo
        }),
      });

      const result: ApiResponse<Producto> = await response.json();

      if (result.success) {
        setSuccess(`Producto ${!producto.activo ? 'activado' : 'desactivado'}`);
        loadProductos();
      } else {
        setError(result.error || 'Error al cambiar estado del producto');
      }
    } catch (error: any) {
      setError('Error al cambiar estado del producto');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const togglePromocion = async (producto: Producto) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/productos/${producto.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          promocion_activa: !producto.promocion_activa
        }),
      });

      const result: ApiResponse<Producto> = await response.json();

      if (result.success) {
        setSuccess(`Promoción ${!producto.promocion_activa ? 'activada' : 'desactivada'}`);
        loadProductos();
      } else {
        setError(result.error || 'Error al cambiar promoción');
      }
    } catch (error: any) {
      setError('Error al cambiar promoción');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      empresa_id: empresaId,
      categoria_id: null,
      subcategoria_id: null,
      nombre: '',
      descripcion: '',
      precio: null,
      imagen_url: '',
      orden: 0,
      activo: true,
      descuento_prom: 0,
      promocion_activa: false
    });
    setSubcategorias([]);
  };

  const getPrecioConDescuento = (precio: number, descuento: number): number => {
    return precio - (precio * descuento / 100);
  };

  const formatPrice = (price: number | null): string => {
    if (price === null) return 'Sin precio';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  return (
    <div className="space-y-6">
      {/* Mensajes de estado */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-red-600" />
          <span className="text-red-700">{error}</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setError('')}
            className="ml-auto text-red-600 hover:text-red-700"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <span className="text-green-700">{success}</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSuccess('')}
            className="ml-auto text-green-600 hover:text-green-700"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Package className="h-6 w-6" />
            Gestión de Productos
          </h2>
          <p className="text-gray-600 mt-1">
            Administra los productos de tu empresa
          </p>
        </div>
        <Button
          onClick={() => {
            resetForm();
            setEditingProducto(null);
            setShowForm(true);
          }}
          className="bg-blue-600 hover:bg-blue-700"
          disabled={loading}
        >
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Producto
        </Button>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros y Búsqueda
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="busqueda">Buscar producto</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="busqueda"
                  type="text"
                  placeholder="Nombre o descripción..."
                  value={filtros.busqueda}
                  onChange={(e) => setFiltros(prev => ({ ...prev, busqueda: e.target.value }))}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="categoria-filter">Categoría</Label>
              <select
                id="categoria-filter"
                value={filtros.categoria}
                onChange={(e) => setFiltros(prev => ({ ...prev, categoria: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todas las categorías</option>
                {categoriasInternas.map(categoria => (
                  <option key={categoria.id} value={categoria.id.toString()}>
                    {categoria.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center space-x-4 pt-6">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="solo-activos"
                  checked={filtros.soloActivos}
                  onCheckedChange={(checked) => 
                    setFiltros(prev => ({ ...prev, soloActivos: checked as boolean }))
                  }
                />
                <Label htmlFor="solo-activos" className="text-sm">
                  Solo activos
                </Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="solo-promociones"
                  checked={filtros.soloPromociones}
                  onCheckedChange={(checked) => 
                    setFiltros(prev => ({ ...prev, soloPromociones: checked as boolean }))
                  }
                />
                <Label htmlFor="solo-promociones" className="text-sm">
                  En promoción
                </Label>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Formulario de producto */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingProducto ? 'Editar Producto' : 'Nuevo Producto'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nombre">Nombre del producto *</Label>
                  <Input
                    id="nombre"
                    type="text"
                    value={formData.nombre}
                    onChange={(e) => setFormData(prev => ({ ...prev, nombre: e.target.value }))}
                    required
                    placeholder="Ej: iPhone 15 Pro"
                  />
                </div>

                <div>
                  <Label htmlFor="categoria">Categoría</Label>
                  <select
                    id="categoria"
                    value={formData.categoria_id || ''}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      categoria_id: e.target.value ? parseInt(e.target.value) : null 
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Sin categoría</option>
                    {categoriasInternas.map(categoria => (
                      <option key={categoria.id} value={categoria.id}>
                        {categoria.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label htmlFor="subcategoria">Subcategoría</Label>
                  <select
                    id="subcategoria"
                    value={formData.subcategoria_id || ''}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      subcategoria_id: e.target.value ? parseInt(e.target.value) : null 
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={!formData.categoria_id}
                  >
                    <option value="">Sin subcategoría</option>
                    {subcategorias.map(subcategoria => (
                      <option key={subcategoria.id} value={subcategoria.id}>
                        {subcategoria.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label htmlFor="precio">Precio</Label>
                  <Input
                    id="precio"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.precio || ''}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      precio: e.target.value ? parseFloat(e.target.value) : null 
                    }))}
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <Label htmlFor="descuento">Descuento (%)</Label>
                  <Input
                    id="descuento"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.descuento_prom}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      descuento_prom: parseInt(e.target.value) || 0 
                    }))}
                    placeholder="0"
                  />
                </div>

                <div>
                  <Label htmlFor="orden">Orden</Label>
                  <Input
                    id="orden"
                    type="number"
                    min="0"
                    value={formData.orden}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      orden: parseInt(e.target.value) || 0 
                    }))}
                    placeholder="0"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="descripcion">Descripción</Label>
                <textarea
                  id="descripcion"
                  value={formData.descripcion}
                  onChange={(e) => setFormData(prev => ({ ...prev, descripcion: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Descripción del producto..."
                />
              </div>

              <div>
                <Label htmlFor="imagen_url">URL de la imagen</Label>
                <Input
                  id="imagen_url"
                  type="url"
                  value={formData.imagen_url}
                  onChange={(e) => setFormData(prev => ({ ...prev, imagen_url: e.target.value }))}
                  placeholder="https://ejemplo.com/imagen.jpg"
                />
              </div>

              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="activo"
                    checked={formData.activo}
                    onCheckedChange={(checked) => 
                      setFormData(prev => ({ ...prev, activo: checked as boolean }))
                    }
                  />
                  <Label htmlFor="activo">Producto activo</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="promocion_activa"
                    checked={formData.promocion_activa}
                    onCheckedChange={(checked) => 
                      setFormData(prev => ({ ...prev, promocion_activa: checked as boolean }))
                    }
                  />
                  <Label htmlFor="promocion_activa">En promoción</Label>
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForm(false);
                    setEditingProducto(null);
                    resetForm();
                  }}
                  disabled={loading}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={loading || !formData.nombre}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {loading ? 'Guardando...' : (editingProducto ? 'Actualizar' : 'Crear')}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Lista de productos */}
      <Card>
        <CardHeader>
          <CardTitle>
            Productos ({productos.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading && productos.length === 0 ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Cargando productos...</p>
            </div>
          ) : productos.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No hay productos que coincidan con los filtros seleccionados.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {productos.map(producto => (
                <div key={producto.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {producto.imagen_url && (
                          <img
                            src={producto.imagen_url}
                            alt={producto.nombre}
                            className="w-12 h-12 object-cover rounded-lg border"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        )}
                        <div>
                          <h3 className="font-semibold text-lg">{producto.nombre}</h3>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            {producto.categoria && (
                              <Badge variant="secondary" className="text-xs">
                                <Tag className="h-3 w-3 mr-1" />
                                {producto.categoria.nombre}
                              </Badge>
                            )}
                            {producto.subcategoria && (
                              <Badge variant="outline" className="text-xs">
                                {producto.subcategoria.nombre}
                              </Badge>
                            )}
                            <span className="text-gray-400">•</span>
                            <span>Orden: {producto.orden}</span>
                          </div>
                        </div>
                      </div>

                      {producto.descripcion && (
                        <p className="text-gray-600 mb-3 line-clamp-2">{producto.descripcion}</p>
                      )}

                      <div className="flex items-center gap-4 text-sm">
                        {producto.precio && (
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4 text-green-600" />
                            <span className="font-semibold text-green-600">
                              {formatPrice(getPrecioConDescuento(producto.precio, producto.descuento_prom))}
                            </span>
                            {producto.descuento_prom > 0 && (
                              <>
                                <span className="text-gray-400 line-through">
                                  {formatPrice(producto.precio)}
                                </span>
                                <Badge variant="destructive" className="text-xs">
                                  -{producto.descuento_prom}%
                                </Badge>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      {producto.promocion_activa && (
                        <Badge 
                          variant="default" 
                          className="bg-orange-100 text-orange-800 hover:bg-orange-200"
                        >
                          <Star className="h-3 w-3 mr-1" />
                          Promoción
                        </Badge>
                      )}
                      
                      <Badge 
                        variant={producto.activo ? "default" : "secondary"}
                        className={producto.activo ? "bg-green-100 text-green-800 hover:bg-green-200" : ""}
                      >
                        {producto.activo ? 'Activo' : 'Inactivo'}
                      </Badge>

                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(producto)}
                          disabled={loading}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleActivo(producto)}
                          disabled={loading}
                        >
                          {producto.activo ? 
                            <EyeOff className="h-4 w-4" /> : 
                            <Eye className="h-4 w-4" />
                          }
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => togglePromocion(producto)}
                          disabled={loading}
                          className={producto.promocion_activa ? "text-orange-600" : "text-gray-400"}
                        >
                          <Star className="h-4 w-4" />
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(producto)}
                          disabled={loading}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}