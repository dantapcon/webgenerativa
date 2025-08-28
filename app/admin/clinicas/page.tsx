'use client';

import { useState, useEffect } from 'react';
import { ClinicaOftalmologica } from '@/lib/types/oftalmologia';
import { OftalmologiaService } from '@/lib/services/oftalmologia';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Eye, 
  Edit, 
  Trash2, 
  Power, 
  PowerOff, 
  ExternalLink, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar,
  Plus
} from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function AdminClinicasPage() {
  const [clinicas, setClinicas] = useState<ClinicaOftalmologica[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [selectedClinica, setSelectedClinica] = useState<ClinicaOftalmologica | null>(null);

  const showAlert = (type: 'success' | 'error', message: string) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 5000);
  };

  const loadClinicas = async () => {
    try {
      setIsLoading(true);
      const data = await OftalmologiaService.getAllClinicas();
      setClinicas(data);
    } catch (error) {
      console.error('Error loading clinics:', error);
      showAlert('error', 'Error al cargar las clínicas');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadClinicas();
  }, []);

  const handleToggleStatus = async (id: string) => {
    try {
      await OftalmologiaService.toggleClinicaStatus(id);
      showAlert('success', 'Estado de la clínica actualizado');
      loadClinicas(); // Recargar lista
    } catch (error) {
      console.error('Error toggling status:', error);
      showAlert('error', 'Error al cambiar el estado de la clínica');
    }
  };

  const handleDeactivate = async (id: string) => {
    if (confirm('¿Estás seguro de que deseas desactivar esta clínica?')) {
      try {
        await OftalmologiaService.deleteClinica(id);
        showAlert('success', 'Clínica desactivada exitosamente');
        loadClinicas(); // Recargar lista
      } catch (error) {
        console.error('Error deactivating clinic:', error);
        showAlert('error', 'Error al desactivar la clínica');
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-50 to-indigo-100 py-8">
        <div className="container mx-auto max-w-6xl px-4">
          <Card>
            <CardContent className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p>Cargando clínicas...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-50 to-indigo-100 py-8">
      <div className="container mx-auto max-w-6xl px-4">
        <Card className="bg-white/95 backdrop-blur-sm shadow-2xl">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-3xl font-bold text-gray-800 flex items-center space-x-3">
                  <Eye className="h-8 w-8 text-blue-600" />
                  <span>Administrador de Clínicas</span>
                </CardTitle>
                <CardDescription className="text-lg text-gray-600 mt-2">
                  Gestiona todas las clínicas oftalmológicas creadas
                </CardDescription>
              </div>
              <Link href="/oftalmologia">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Nueva Clínica
                </Button>
              </Link>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Alertas */}
            {alert && (
              <Alert className={alert.type === 'success' ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'}>
                <AlertDescription className={alert.type === 'success' ? 'text-green-800' : 'text-red-800'}>
                  {alert.message}
                </AlertDescription>
              </Alert>
            )}

            {/* Estadísticas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">{clinicas.length}</div>
                  <div className="text-sm text-gray-600">Total de Clínicas</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {clinicas.filter(c => c.activo).length}
                  </div>
                  <div className="text-sm text-gray-600">Clínicas Activas</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-gray-600">
                    {clinicas.filter(c => !c.activo).length}
                  </div>
                  <div className="text-sm text-gray-600">Clínicas Inactivas</div>
                </CardContent>
              </Card>
            </div>

            {/* Lista de Clínicas */}
            {clinicas.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Eye className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-gray-700 mb-2">No hay clínicas creadas</h3>
                  <p className="text-gray-500 mb-4">
                    Comienza creando tu primera clínica oftalmológica
                  </p>
                  <Link href="/oftalmologia">
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Crear Primera Clínica
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {clinicas.map((clinica) => (
                  <Card key={clinica.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <CardTitle className="text-xl text-gray-800 flex items-center space-x-2">
                            {clinica.logo_url && (
                              <img 
                                src={clinica.logo_url} 
                                alt={`Logo ${clinica.titulo}`}
                                className="w-10 h-10 rounded object-cover"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                }}
                              />
                            )}
                            <span>{clinica.titulo}</span>
                          </CardTitle>
                          {clinica.lema && (
                            <CardDescription className="text-sm italic mt-1">
                              "{clinica.lema}"
                            </CardDescription>
                          )}
                        </div>
                        <Badge variant={clinica.activo ? 'default' : 'secondary'}>
                          {clinica.activo ? 'Activa' : 'Inactiva'}
                        </Badge>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      {/* Información de contacto */}
                      <div className="grid grid-cols-1 gap-2 text-sm">
                        {clinica.telefono && (
                          <div className="flex items-center space-x-2 text-gray-600">
                            <Phone className="h-4 w-4" />
                            <span>{clinica.telefono}</span>
                          </div>
                        )}
                        {clinica.email && (
                          <div className="flex items-center space-x-2 text-gray-600">
                            <Mail className="h-4 w-4" />
                            <span>{clinica.email}</span>
                          </div>
                        )}
                        {clinica.direccion && (
                          <div className="flex items-center space-x-2 text-gray-600">
                            <MapPin className="h-4 w-4" />
                            <span className="text-xs">{clinica.direccion}</span>
                          </div>
                        )}
                      </div>

                      {/* Fecha de creación */}
                      <div className="flex items-center space-x-2 text-xs text-gray-500">
                        <Calendar className="h-4 w-4" />
                        <span>
                          Creada: {format(new Date(clinica.created_at), 'dd MMM yyyy, HH:mm', { locale: es })}
                        </span>
                      </div>

                      {/* Quiénes somos (preview) */}
                      <div className="bg-gray-50 p-3 rounded text-sm">
                        <p className="text-gray-700 line-clamp-3">
                          {clinica.quienes_somos.length > 150 
                            ? `${clinica.quienes_somos.substring(0, 150)}...` 
                            : clinica.quienes_somos
                          }
                        </p>
                      </div>

                      {/* Botones de acción */}
                      <div className="flex flex-wrap gap-2 pt-2">
                        <Link href={`/clinicas/${clinica.id}`}>
                          <Button variant="outline" size="sm">
                            <ExternalLink className="h-4 w-4 mr-1" />
                            Ver Página
                          </Button>
                        </Link>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedClinica(clinica)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Detalles
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleStatus(clinica.id)}
                          className={clinica.activo ? 'text-orange-600' : 'text-green-600'}
                        >
                          {clinica.activo ? (
                            <>
                              <PowerOff className="h-4 w-4 mr-1" />
                              Desactivar
                            </>
                          ) : (
                            <>
                              <Power className="h-4 w-4 mr-1" />
                              Activar
                            </>
                          )}
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeactivate(clinica.id)}
                          className="text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Eliminar
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Modal de detalles */}
        {selectedClinica && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="max-w-2xl w-full max-h-96 overflow-y-auto">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-xl">{selectedClinica.titulo}</CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedClinica(null)}
                  >
                    ×
                  </Button>
                </div>
                {selectedClinica.lema && (
                  <CardDescription className="italic">"{selectedClinica.lema}"</CardDescription>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold mb-2 flex items-center">
                      <Phone className="h-4 w-4 mr-1" />
                      Teléfono:
                    </h4>
                    <p className="text-sm text-gray-600">{selectedClinica.telefono || 'No especificado'}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2 flex items-center">
                      <Mail className="h-4 w-4 mr-1" />
                      Email:
                    </h4>
                    <p className="text-sm text-gray-600">{selectedClinica.email || 'No especificado'}</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2 flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    Dirección:
                  </h4>
                  <p className="text-sm text-gray-600">{selectedClinica.direccion || 'No especificada'}</p>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Quiénes Somos:</h4>
                  <div className="bg-gray-50 p-3 rounded text-sm">
                    <p className="text-gray-700">{selectedClinica.quienes_somos}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold mb-2">Misión:</h4>
                    <div className="bg-gray-50 p-3 rounded text-sm">
                      <p className="text-gray-700">{selectedClinica.mision}</p>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Visión:</h4>
                    <div className="bg-gray-50 p-3 rounded text-sm">
                      <p className="text-gray-700">{selectedClinica.vision}</p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <Link href={`/clinicas/${selectedClinica.id}`}>
                    <Button>
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Ver Página Web
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
