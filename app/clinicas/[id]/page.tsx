'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { ClinicaCompleta } from '@/lib/types/oftalmologia';
import { OftalmologiaService } from '@/lib/services/oftalmologia';
import { Card, CardContent } from '@/components/ui/card';
import { Eye, Phone, Mail, MapPin, ArrowDown, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function ClinicaWebsitePage() {
  const params = useParams();
  const [clinica, setClinica] = useState<ClinicaCompleta | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadClinica = async () => {
      try {
        const id = params.id as string;
        const data = await OftalmologiaService.getClinicaById(id);
        
        if (!data) {
          setError('Clínica no encontrada');
          return;
        }

        if (!data.activo) {
          setError('Esta clínica no está disponible públicamente');
          return;
        }

        setClinica(data);
      } catch (error) {
        console.error('Error loading clinic:', error);
        setError('Error al cargar la información de la clínica');
      } finally {
        setIsLoading(false);
      }
    };

    if (params.id) {
      loadClinica();
    }
  }, [params.id]);

  // Estilos CSS dinámicos
  const getCSS = (estilos: any) => {
    const styles = estilos || OftalmologiaService.getDefaultStyles();
    return `
      :root {
        --primary-color: ${styles.color_primario || '#2c5aa0'};
        --secondary-color: ${styles.color_secundario || '#1e3a8a'};
        --accent-color: ${styles.color_acento || '#3b82f6'};
        --light-blue: ${styles.color_fondo || '#eff6ff'};
        --text-dark: ${styles.color_texto || '#1f2937'};
        --text-gray: #6b7280;
        --fuente-principal: '${styles.fuente_principal || 'Poppins'}', sans-serif;
        --tamano-fuente: ${styles.tamano_fuente || '16px'};
        --border-radius-btn: ${styles.estilo_botones === 'rounded' ? '25px' : 
                              styles.estilo_botones === 'square' ? '4px' : '50px'};
      }
      
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }
      
      body {
        font-family: var(--fuente-principal);
        line-height: 1.6;
        color: var(--text-dark);
        font-size: var(--tamano-fuente);
      }
      
      /* Header Styles */
      .header {
        background: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%);
        color: white;
        padding: 1rem 0;
        position: relative;
        overflow: hidden;
      }
      
      .header::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="20" cy="20" r="1" fill="white" opacity="0.1"/><circle cx="80" cy="40" r="1" fill="white" opacity="0.1"/><circle cx="40" cy="80" r="1" fill="white" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
        opacity: 0.1;
      }
      
      .logo {
        max-width: 80px;
        max-height: 80px;
        object-fit: contain;
        border-radius: 8px;
      }
      
      .clinic-title {
        color: white;
        font-size: 2.5rem;
        font-weight: 700;
        margin-bottom: 0.5rem;
      }
      
      .clinic-slogan {
        color: rgba(255, 255, 255, 0.9);
        font-size: 1.1rem;
        font-style: italic;
      }
      
      .contact-info {
        text-align: right;
      }
      
      .contact-item {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        margin-bottom: 0.5rem;
        color: white;
        font-size: 0.9rem;
      }
      
      .contact-item svg {
        margin-right: 0.5rem;
      }
      
      /* Navigation */
      .navbar {
        background: rgba(255, 255, 255, 0.95);
        backdrop-filter: blur(10px);
        position: sticky;
        top: 0;
        z-index: 1000;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      }
      
      .nav-link {
        color: var(--text-dark);
        text-decoration: none;
        padding: 0.75rem 1rem;
        transition: color 0.3s ease;
        font-weight: 500;
      }
      
      .nav-link:hover {
        color: var(--primary-color);
      }
      
      /* Hero Section */
      .hero {
        background: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%);
        color: white;
        padding: 4rem 0;
        text-align: center;
      }
      
      .hero h1 {
        font-size: 3rem;
        font-weight: 700;
        margin-bottom: 1.5rem;
        text-shadow: 0 2px 4px rgba(0,0,0,0.3);
      }
      
      .hero p {
        font-size: 1.2rem;
        margin-bottom: 2rem;
        opacity: 0.9;
      }
      
      .btn {
        background: var(--accent-color);
        color: white;
        padding: 0.75rem 2rem;
        border: none;
        border-radius: var(--border-radius-btn);
        text-decoration: none;
        font-weight: 600;
        transition: all 0.3s ease;
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
      }
      
      .btn:hover {
        background: var(--primary-color);
        transform: translateY(-2px);
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
      }
      
      /* Section Styles */
      .section {
        padding: 4rem 0;
      }
      
      .section-title {
        color: var(--primary-color);
        font-size: 2.5rem;
        font-weight: 700;
        text-align: center;
        margin-bottom: 1rem;
      }
      
      .section-subtitle {
        text-align: center;
        color: var(--text-gray);
        font-size: 1.1rem;
        margin-bottom: 3rem;
      }
      
      /* About Section */
      .about-section {
        background: var(--light-blue);
      }
      
      .about-text {
        font-size: 1.1rem;
        line-height: 1.8;
        color: var(--text-dark);
        text-align: center;
        max-width: 800px;
        margin: 0 auto;
      }
      
      /* Mission Vision Section */
      .mission-vision {
        background: white;
      }
      
      .mission-card, .vision-card {
        background: white;
        border-left: 5px solid var(--primary-color);
        padding: 2rem;
        border-radius: 10px;
        box-shadow: 0 5px 20px rgba(0,0,0,0.1);
        height: 100%;
      }
      
      .vision-card {
        border-left-color: var(--accent-color);
      }
      
      .mission-title, .vision-title {
        color: var(--primary-color);
        font-weight: 700;
        font-size: 1.5rem;
        margin-bottom: 1rem;
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }
      
      .vision-title {
        color: var(--accent-color);
      }
      
      /* Footer */
      .footer {
        background: var(--text-dark);
        color: white;
        padding: 3rem 0 1rem;
      }
      
      .footer h5 {
        color: var(--accent-color);
        margin-bottom: 1rem;
        font-weight: 600;
      }
      
      .footer-links {
        list-style: none;
      }
      
      .footer-links li {
        margin-bottom: 0.5rem;
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }
      
      .footer-links a {
        color: #d1d5db;
        text-decoration: none;
        transition: color 0.3s ease;
      }
      
      .footer-links a:hover {
        color: var(--accent-color);
      }
      
      .copyright {
        border-top: 1px solid #374151;
        padding-top: 1rem;
        margin-top: 2rem;
        text-align: center;
        color: #9ca3af;
      }
      
      /* Animations */
      .fade-in {
        animation: fadeIn 0.8s ease-in;
      }
      
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
      }
      
      .slide-in-left {
        animation: slideInLeft 0.8s ease-out;
      }
      
      @keyframes slideInLeft {
        from { opacity: 0; transform: translateX(-50px); }
        to { opacity: 1; transform: translateX(0); }
      }
      
      .slide-in-right {
        animation: slideInRight 0.8s ease-out;
      }
      
      @keyframes slideInRight {
        from { opacity: 0; transform: translateX(50px); }
        to { opacity: 1; transform: translateX(0); }
      }
      
      /* Responsive */
      @media (max-width: 768px) {
        .clinic-title {
          font-size: 1.8rem;
        }
        
        .hero h1 {
          font-size: 2rem;
        }
        
        .section-title {
          font-size: 2rem;
        }
        
        .contact-info {
          text-align: left;
          margin-top: 1rem;
        }
        
        .mission-card, .vision-card {
          margin-bottom: 1rem;
        }
      }
      
      .container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 0 1rem;
      }
      
      .row {
        display: flex;
        flex-wrap: wrap;
        margin: 0 -15px;
      }
      
      .col-12 { flex: 0 0 100%; max-width: 100%; padding: 0 15px; }
      .col-lg-4 { flex: 0 0 33.333333%; max-width: 33.333333%; padding: 0 15px; }
      .col-lg-8 { flex: 0 0 66.666667%; max-width: 66.666667%; padding: 0 15px; }
      .col-md-2 { flex: 0 0 16.666667%; max-width: 16.666667%; padding: 0 15px; }
      .col-md-3 { flex: 0 0 25%; max-width: 25%; padding: 0 15px; }
      .col-md-6 { flex: 0 0 50%; max-width: 50%; padding: 0 15px; }
      .col-md-7 { flex: 0 0 58.333333%; max-width: 58.333333%; padding: 0 15px; }
      
      @media (max-width: 768px) {
        .col-md-2, .col-md-3, .col-md-6, .col-md-7 { 
          flex: 0 0 100%; 
          max-width: 100%; 
        }
        .col-lg-4, .col-lg-8 { 
          flex: 0 0 100%; 
          max-width: 100%; 
        }
      }
      
      .align-items-center { align-items: center; }
      .justify-content-center { justify-content: center; }
      .text-center { text-align: center; }
      .mx-auto { margin-left: auto; margin-right: auto; }
      .mb-4 { margin-bottom: 1.5rem; }
    `;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <Card>
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>Cargando página de la clínica...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !clinica) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <Card>
          <CardContent className="p-8 text-center">
            <Eye className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-700 mb-2">
              {error || 'Clínica no encontrada'}
            </h3>
            <p className="text-gray-500 mb-4">
              La página que buscas no está disponible.
            </p>
            <Link href="/oftalmologia">
              <Button>Volver al inicio</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      {/* Estilos dinámicos */}
      <style dangerouslySetInnerHTML={{ __html: getCSS(clinica.estilos) }} />
      
      {/* Google Fonts */}
      <link
        href={`https://fonts.googleapis.com/css2?family=${(clinica.estilos?.fuente_principal || 'Poppins').replace(' ', '+')}:wght@300;400;600;700&display=swap`}
        rel="stylesheet"
      />
      
      <div style={{ fontFamily: 'var(--fuente-principal)' }}>
        {/* Header */}
        <header className="header">
          <div className="container">
            <div className="row align-items-center">
              <div className="col-md-2">
                {clinica.logo_url ? (
                  <img src={clinica.logo_url} alt={`Logo ${clinica.titulo}`} className="logo" />
                ) : (
                  <div className="text-center">
                    <Eye size={64} />
                  </div>
                )}
              </div>
              <div className="col-md-7">
                <h1 className="clinic-title">{clinica.titulo}</h1>
                {clinica.lema && (
                  <p className="clinic-slogan">{clinica.lema}</p>
                )}
              </div>
              <div className="col-md-3">
                <div className="contact-info">
                  {clinica.telefono && (
                    <div className="contact-item">
                      <Phone size={16} />
                      <span>{clinica.telefono}</span>
                    </div>
                  )}
                  {clinica.email && (
                    <div className="contact-item">
                      <Mail size={16} />
                      <span>{clinica.email}</span>
                    </div>
                  )}
                  {clinica.direccion && (
                    <div className="contact-item">
                      <MapPin size={16} />
                      <span>{clinica.direccion}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Navigation */}
        <nav className="navbar">
          <div className="container">
            <div className="row">
              <div className="col-12">
                <ul style={{ display: 'flex', listStyle: 'none', margin: 0, padding: 0 }}>
                  <li><a className="nav-link" href="#inicio">Inicio</a></li>
                  <li><a className="nav-link" href="#quienes-somos">Quiénes Somos</a></li>
                  <li><a className="nav-link" href="#mision-vision">Misión y Visión</a></li>
                  <li><a className="nav-link" href="#contacto">Contacto</a></li>
                </ul>
              </div>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section id="inicio" className="hero">
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-lg-8">
                <h1 className="fade-in">Cuidamos tu Visión</h1>
                <p className="fade-in">
                  Tecnología de vanguardia y atención personalizada para el cuidado integral de sus ojos
                </p>
                <a href="#quienes-somos" className="btn">
                  <ArrowDown size={20} />
                  Conocer Más
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Quiénes Somos */}
        <section id="quienes-somos" className="section about-section">
          <div className="container">
            <div className="row">
              <div className="col-12">
                <h2 className="section-title slide-in-left">Quiénes Somos</h2>
                <p className="section-subtitle">Conoce nuestra historia y experiencia</p>
              </div>
            </div>
            <div className="row align-items-center">
              <div className="col-lg-8 mx-auto">
                <div className="about-text slide-in-right">
                  {clinica.quienes_somos.split('\n').map((paragraph, index) => (
                    <p key={index} style={{ marginBottom: '1rem' }}>
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Misión y Visión */}
        <section id="mision-vision" className="section mission-vision">
          <div className="container">
            <div className="row">
              <div className="col-12">
                <h2 className="section-title">Misión y Visión</h2>
                <p className="section-subtitle">Nuestro propósito y objetivos</p>
              </div>
            </div>
            <div className="row">
              <div className="col-md-6 mb-4">
                <div className="mission-card">
                  <h3 className="mission-title">
                    <CheckCircle size={24} />
                    Misión
                  </h3>
                  {clinica.mision.split('\n').map((paragraph, index) => (
                    <p key={index} style={{ marginBottom: '1rem' }}>
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>
              <div className="col-md-6 mb-4">
                <div className="vision-card">
                  <h3 className="vision-title">
                    <Eye size={24} />
                    Visión
                  </h3>
                  {clinica.vision.split('\n').map((paragraph, index) => (
                    <p key={index} style={{ marginBottom: '1rem' }}>
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer id="contacto" className="footer">
          <div className="container">
            <div className="row">
              <div className="col-lg-4 mb-4">
                <h5>Contacto</h5>
                <ul className="footer-links">
                  {clinica.direccion && (
                    <li>
                      <MapPin size={16} />
                      {clinica.direccion}
                    </li>
                  )}
                  {clinica.telefono && (
                    <li>
                      <Phone size={16} />
                      {clinica.telefono}
                    </li>
                  )}
                  {clinica.email && (
                    <li>
                      <Mail size={16} />
                      {clinica.email}
                    </li>
                  )}
                </ul>
              </div>
              <div className="col-lg-4 mb-4">
                <h5>Servicios</h5>
                <ul className="footer-links">
                  <li><a href="#">Consultas Oftalmológicas</a></li>
                  <li><a href="#">Cirugía Refractiva</a></li>
                  <li><a href="#">Tratamiento de Cataratas</a></li>
                  <li><a href="#">Cirugía de Retina</a></li>
                  <li><a href="#">Glaucoma</a></li>
                </ul>
              </div>
              <div className="col-lg-4 mb-4">
                <h5>Información</h5>
                <ul className="footer-links">
                  <li><a href="#quienes-somos">Quiénes Somos</a></li>
                  <li><a href="#mision-vision">Misión y Visión</a></li>
                  <li><a href="#contacto">Contacto</a></li>
                </ul>
              </div>
            </div>
            <div className="copyright">
              <p>&copy; 2025 {clinica.titulo}. Todos los derechos reservados.</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
