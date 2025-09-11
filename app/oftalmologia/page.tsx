'use client';

import { useState, useEffect } from 'react';
import { ClinicaFormData } from '@/lib/types/oftalmologia';
import { OftalmologiaService } from '@/lib/services/oftalmologia';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Eye, Globe, Palette, Building, Users, Phone, Mail, MapPin, Quote, Image, Heading, Target } from 'lucide-react';
import Link from 'next/link';

export default function AdminFormPage() {
  const [formData, setFormData] = useState<ClinicaFormData>({
    titulo: '',
    lema: '',
    logo_url: '',
    quienes_somos: '',
    mision: '',
    vision: '',
    telefono: '',
    email: '',
    direccion: '',
    color_primario: '#2c5aa0',
    color_secundario: '#1e3a8a',
    color_acento: '#3b82f6',
    color_texto: '#1f2937',
    color_fondo: '#ffffff',
    fuente_principal: 'Poppins',
    fuente_titulo: 'Poppins',
    tamano_fuente: '16px',
    estilo_botones: 'rounded',
    tema_general: 'moderno'
  });

  const [isLoading, setIsLoading] = useState(false);
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showAlert = (type: 'success' | 'error', message: string) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 5000);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const setExampleLogo = () => {
    setFormData(prev => ({
      ...prev,
      logo_url: 'https://via.placeholder.com/150x150/2c5aa0/white?text=LOGO'
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validar campos requeridos
      if (!formData.titulo || !formData.quienes_somos || !formData.mision || !formData.vision) {
        showAlert('error', 'Por favor completa todos los campos requeridos');
        return;
      }

      const result = await OftalmologiaService.createClinica(formData);
      
      showAlert('success', `¡Clínica "${result.clinica.titulo}" creada exitosamente!`);
      
      // Limpiar formulario
      setFormData({
        titulo: '',
        lema: '',
        logo_url: '',
        quienes_somos: '',
        mision: '',
        vision: '',
        telefono: '',
        email: '',
        direccion: '',
        color_primario: '#2c5aa0',
        color_secundario: '#1e3a8a',
        color_acento: '#3b82f6',
        color_texto: '#1f2937',
        color_fondo: '#ffffff',
        fuente_principal: 'Poppins',
        fuente_titulo: 'Poppins',
        tamano_fuente: '16px',
        estilo_botones: 'rounded',
        tema_general: 'moderno'
      });

      // Mostrar enlaces a la página generada
      setTimeout(() => {
        showAlert('success', `Página web disponible en: /clinicas/${result.clinica.id}`);
      }, 2000);

    } catch (error) {
      console.error('Error creating clinic:', error);
      showAlert('error', 'Error al crear la clínica. Por favor intenta nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  // Actualizar vista previa de colores
  useEffect(() => {
    const previewHeader = document.getElementById('preview-header');
    const previewBtn = document.getElementById('preview-btn');
    const previewText = document.getElementById('preview-text');
    const previewLink = document.getElementById('preview-link');

    if (previewHeader) {
      previewHeader.style.background = `linear-gradient(135deg, ${formData.color_primario} 0%, ${formData.color_secundario} 100%)`;
    }

    if (previewBtn) {
      previewBtn.style.backgroundColor = formData.color_primario || '#2c5aa0';
      const borderRadius = formData.estilo_botones === 'rounded' ? '25px' : 
                          formData.estilo_botones === 'square' ? '4px' : '50px';
      previewBtn.style.borderRadius = borderRadius;
    }

    if (previewText) {
      previewText.style.fontFamily = `'${formData.fuente_principal}', sans-serif`;
      previewText.style.fontSize = formData.tamano_fuente || '16px';
    }

    if (previewLink) {
      previewLink.style.color = formData.color_acento || '#3b82f6';
    }
  }, [formData.color_primario, formData.color_secundario, formData.color_acento, formData.fuente_principal, formData.tamano_fuente, formData.estilo_botones]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-50 to-indigo-100 py-8">
      <div className="container mx-auto max-w-4xl px-4">
        <Card className="bg-white/95 backdrop-blur-sm shadow-2xl">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Eye className="h-12 w-12 text-blue-600" />
            </div>
            <CardTitle className="text-3xl font-bold text-gray-800">
              Generador de Páginas Oftalmológicas
            </CardTitle>
            <CardDescription className="text-lg text-gray-600">
              Panel de Administrador
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-8">
            {/* Alertas */}
            {alert && (
              <Alert className={alert.type === 'success' ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'}>
                <AlertDescription className={alert.type === 'success' ? 'text-green-800' : 'text-red-800'}>
                  {alert.message}
                </AlertDescription>
              </Alert>
            )}

            {/* Botones de navegación */}
            <div className="flex justify-center space-x-4">
              <Link href="/admin/clinicas">
                <Button variant="outline" className="flex items-center space-x-2">
                  <Users className="h-4 w-4" />
                  <span>Ver Clínicas Creadas</span>
                </Button>
              </Link>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Información Básica */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-gray-800 flex items-center space-x-2">
                  <Building className="h-5 w-5" />
                  <span>Información Básica</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <Label htmlFor="titulo" className="flex items-center space-x-1">
                      <Heading className="h-4 w-4" />
                      <span>Título de la Clínica *</span>
                    </Label>
                    <Input
                      id="titulo"
                      name="titulo"
                      type="text"
                      required
                      value={formData.titulo}
                      onChange={handleInputChange}
                      placeholder="Ej: Instituto de la Visión"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="telefono" className="flex items-center space-x-1">
                      <Phone className="h-4 w-4" />
                      <span>Teléfono</span>
                    </Label>
                    <Input
                      id="telefono"
                      name="telefono"
                      type="tel"
                      value={formData.telefono}
                      onChange={handleInputChange}
                      placeholder="Ej: +593 2 123-4567"
                      className="mt-1"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email" className="flex items-center space-x-1">
                      <Mail className="h-4 w-4" />
                      <span>Email</span>
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="info@clinica.com"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="logo_url" className="flex items-center space-x-1">
                      <Image className="h-4 w-4" />
                      <span>URL del Logo</span>
                    </Label>
                    <div className="flex space-x-2">
                      <Input
                        id="logo_url"
                        name="logo_url"
                        type="url"
                        value={formData.logo_url}
                        onChange={handleInputChange}
                        placeholder="https://ejemplo.com/logo.png"
                        className="mt-1"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={setExampleLogo}
                        className="mt-1"
                      >
                        Ejemplo
                      </Button>
                    </div>
                    {formData.logo_url && (
                      <div className="mt-2">
                        <img 
                          src={formData.logo_url} 
                          alt="Vista previa" 
                          className="max-w-20 max-h-20 rounded border"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="lema" className="flex items-center space-x-1">
                    <Quote className="h-4 w-4" />
                    <span>Lema o Slogan</span>
                  </Label>
                  <Input
                    id="lema"
                    name="lema"
                    type="text"
                    value={formData.lema}
                    onChange={handleInputChange}
                    placeholder="Ej: Tu visión es nuestra misión"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="direccion" className="flex items-center space-x-1">
                    <MapPin className="h-4 w-4" />
                    <span>Dirección</span>
                  </Label>
                  <Input
                    id="direccion"
                    name="direccion"
                    type="text"
                    value={formData.direccion}
                    onChange={handleInputChange}
                    placeholder="Ej: Av. 10 de Agosto N24-226 y Cordero, Quito"
                    className="mt-1"
                  />
                </div>
              </div>

              {/* Información Institucional */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-gray-800 flex items-center space-x-2">
                  <Users className="h-5 w-5" />
                  <span>Información Institucional</span>
                </h3>

                <div>
                  <Label htmlFor="quienes_somos" className="flex items-center space-x-1">
                    <Building className="h-4 w-4" />
                    <span>Quiénes Somos *</span>
                  </Label>
                  <textarea
                    id="quienes_somos"
                    name="quienes_somos"
                    required
                    value={formData.quienes_somos}
                    onChange={handleInputChange}
                    placeholder="Describe la historia, trayectoria y especialización de la clínica..."
                    className="mt-1 min-h-32 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:border-blue-500"
                    rows={4}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="mision" className="flex items-center space-x-1">
                      <Target className="h-4 w-4" />
                      <span>Misión *</span>
                    </Label>
                    <textarea
                      id="mision"
                      name="mision"
                      required
                      value={formData.mision}
                      onChange={handleInputChange}
                      placeholder="Define el propósito y objetivos principales de la clínica..."
                      className="mt-1 min-h-32 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:border-blue-500"
                      rows={4}
                    />
                  </div>
                  <div>
                    <Label htmlFor="vision" className="flex items-center space-x-1">
                      <Eye className="h-4 w-4" />
                      <span>Visión *</span>
                    </Label>
                    <textarea
                      id="vision"
                      name="vision"
                      required
                      value={formData.vision}
                      onChange={handleInputChange}
                      placeholder="Describe las metas a largo plazo y aspiraciones de la clínica..."
                      className="mt-1 min-h-32 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:border-blue-500"
                      rows={4}
                    />
                  </div>
                </div>
              </div>

              {/* Personalización de Estilos */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-gray-800 flex items-center space-x-2">
                  <Palette className="h-5 w-5" />
                  <span>Personalización de Estilos</span>
                </h3>
                <p className="text-gray-600 text-sm">
                  Personaliza los colores, fuentes y apariencia de tu página web
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="color_primario">Color Primario</Label>
                    <div className="flex space-x-2 mt-1">
                      <input
                        type="color"
                        id="color_primario"
                        name="color_primario"
                        value={formData.color_primario}
                        onChange={handleInputChange}
                        className="w-12 h-10 rounded border"
                      />
                      <Input
                        type="text"
                        value={formData.color_primario}
                        onChange={handleInputChange}
                        name="color_primario"
                        className="flex-1"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="color_secundario">Color Secundario</Label>
                    <div className="flex space-x-2 mt-1">
                      <input
                        type="color"
                        id="color_secundario"
                        name="color_secundario"
                        value={formData.color_secundario}
                        onChange={handleInputChange}
                        className="w-12 h-10 rounded border"
                      />
                      <Input
                        type="text"
                        value={formData.color_secundario}
                        onChange={handleInputChange}
                        name="color_secundario"
                        className="flex-1"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="color_acento">Color de Acento</Label>
                    <div className="flex space-x-2 mt-1">
                      <input
                        type="color"
                        id="color_acento"
                        name="color_acento"
                        value={formData.color_acento}
                        onChange={handleInputChange}
                        className="w-12 h-10 rounded border"
                      />
                      <Input
                        type="text"
                        value={formData.color_acento}
                        onChange={handleInputChange}
                        name="color_acento"
                        className="flex-1"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="fuente_principal">Fuente Principal</Label>
                    <select
                      id="fuente_principal"
                      name="fuente_principal"
                      value={formData.fuente_principal}
                      onChange={handleInputChange}
                      className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:border-blue-500"
                    >
                      <option value="Poppins">Poppins</option>
                      <option value="Roboto">Roboto</option>
                      <option value="Open Sans">Open Sans</option>
                      <option value="Lato">Lato</option>
                      <option value="Montserrat">Montserrat</option>
                      <option value="Inter">Inter</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="tamano_fuente">Tamaño de Fuente</Label>
                    <select
                      id="tamano_fuente"
                      name="tamano_fuente"
                      value={formData.tamano_fuente}
                      onChange={handleInputChange}
                      className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:border-blue-500"
                    >
                      <option value="14px">Pequeño (14px)</option>
                      <option value="16px">Medio (16px)</option>
                      <option value="18px">Grande (18px)</option>
                      <option value="20px">Muy Grande (20px)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="estilo_botones">Estilo de Botones</Label>
                    <select
                      id="estilo_botones"
                      name="estilo_botones"
                      value={formData.estilo_botones}
                      onChange={handleInputChange}
                      className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:border-blue-500"
                    >
                      <option value="rounded">Redondeados</option>
                      <option value="square">Cuadrados</option>
                      <option value="pill">Tipo Píldora</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="tema_general">Tema General</Label>
                    <select
                      id="tema_general"
                      name="tema_general"
                      value={formData.tema_general}
                      onChange={handleInputChange}
                      className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:border-blue-500"
                    >
                      <option value="moderno">Moderno</option>
                      <option value="clasico">Clásico</option>
                      <option value="minimalista">Minimalista</option>
                      <option value="corporativo">Corporativo</option>
                    </select>
                  </div>
                </div>

                {/* Vista Previa */}
                <div className="space-y-4">
                  <h5 className="text-lg font-medium text-gray-800 flex items-center space-x-2">
                    <Eye className="h-4 w-4" />
                    <span>Vista Previa</span>
                  </h5>
                  <div className="p-4 border rounded-lg bg-gray-50">
                    <div 
                      id="preview-header" 
                      className="mb-3 p-4 rounded text-white text-center"
                      style={{ background: `linear-gradient(135deg, ${formData.color_primario} 0%, ${formData.color_secundario} 100%)` }}
                    >
                      <h6 className="mb-1">Instituto de la Visión</h6>
                      <small className="opacity-75">Tu visión es nuestra misión</small>
                    </div>
                    <div className="mb-3">
                      <button 
                        id="preview-btn" 
                        className="px-4 py-2 text-white font-medium"
                        style={{ 
                          backgroundColor: formData.color_primario,
                          borderRadius: formData.estilo_botones === 'rounded' ? '25px' : 
                                         formData.estilo_botones === 'square' ? '4px' : '50px'
                        }}
                      >
                        Botón de Ejemplo
                      </button>
                    </div>
                    <div>
                      <p 
                        id="preview-text" 
                        className="mb-2"
                        style={{ 
                          fontFamily: `'${formData.fuente_principal}', sans-serif`,
                          fontSize: formData.tamano_fuente 
                        }}
                      >
                        Este es un texto de ejemplo con la configuración actual de colores y fuentes.
                      </p>
                      <a 
                        href="#" 
                        id="preview-link"
                        style={{ color: formData.color_acento }}
                      >
                        Enlace de ejemplo
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Botón de envío */}
              <div className="text-center">
                <Button 
                  type="submit" 
                  disabled={isLoading}
                  className="px-8 py-3 text-lg font-medium bg-blue-600 hover:bg-blue-700"
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Generando...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <Globe className="h-5 w-5" />
                      <span>Generar Página Web</span>
                    </div>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
