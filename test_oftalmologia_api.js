#!/usr/bin/env node

// Script de prueba para verificar la funcionalidad de la API de oftalmología
// Ejecutar con: node test_oftalmologia_api.js

const API_BASE_URL = 'http://localhost:3000/api';

// Datos de ejemplo para una nueva clínica
const clinicaData = {
  titulo: "Centro Oftalmológico Visión Total",
  lema: "Tu visión es nuestro compromiso",
  logo_url: "https://via.placeholder.com/150x150/2c5aa0/white?text=LOGO",
  quienes_somos: "Somos un centro oftalmológico especializado con más de 15 años de experiencia en el cuidado de la salud visual. Nuestro equipo de médicos especializados utiliza tecnología de vanguardia para ofrecer diagnósticos precisos y tratamientos efectivos. Nos especializamos en cirugía refractiva, tratamiento de cataratas, glaucoma y enfermedades de la retina.",
  mision: "Proporcionar atención oftalmológica integral de la más alta calidad, utilizando tecnología avanzada y un enfoque humano y personalizado para cada paciente, contribuyendo a preservar y mejorar su salud visual.",
  vision: "Ser el centro oftalmológico de referencia en la región, reconocido por nuestra excelencia médica, innovación tecnológica y compromiso con la prevención y tratamiento de enfermedades visuales.",
  telefono: "+593 2 234-5678",
  email: "info@visiontotal.com",
  direccion: "Av. República del Salvador N34-125 y Suiza, Edificio Médico Torre Vitalis, Piso 8",
  // Estilos personalizados
  color_primario: "#2c5aa0",
  color_secundario: "#1e3a8a",
  color_acento: "#3b82f6",
  color_texto: "#1f2937",
  color_fondo: "#ffffff",
  fuente_principal: "Poppins",
  fuente_titulo: "Poppins",
  tamano_fuente: "16px",
  estilo_botones: "rounded",
  tema_general: "moderno"
};

async function testAPI() {
  console.log('🧪 Iniciando pruebas de la API de Oftalmología...\n');

  try {
    // Crear nueva clínica
    console.log('📝 Creando nueva clínica...');
    const createResponse = await fetch(`${API_BASE_URL}/clinicas`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(clinicaData)
    });

    const createResult = await createResponse.json();
    
    if (createResponse.ok && createResult.success) {
      console.log('✅ Clínica creada exitosamente!');
      console.log(`   ID: ${createResult.clinica_id}`);
      console.log(`   URL de la página: ${createResult.website_url}\n`);
      
      const clinicaId = createResult.clinica_id;
      
      // Obtener la clínica creada
      console.log('🔍 Obteniendo información de la clínica...');
      const getResponse = await fetch(`${API_BASE_URL}/clinicas/${clinicaId}`);
      const getResult = await getResponse.json();
      
      if (getResponse.ok && getResult.success) {
        console.log('✅ Clínica obtenida exitosamente!');
        console.log(`   Título: ${getResult.data.titulo}`);
        console.log(`   Estado: ${getResult.data.activo ? 'Activa' : 'Inactiva'}`);
        console.log(`   Fecha de creación: ${new Date(getResult.data.created_at).toLocaleString()}\n`);
      } else {
        console.error('❌ Error al obtener la clínica:', getResult.error);
      }
      
      // Obtener todas las clínicas
      console.log('📋 Obteniendo lista de todas las clínicas...');
      const listResponse = await fetch(`${API_BASE_URL}/clinicas`);
      const listResult = await listResponse.json();
      
      if (listResponse.ok && listResult.success) {
        console.log(`✅ Lista obtenida exitosamente! Total: ${listResult.data.length} clínicas\n`);
        
        listResult.data.forEach((clinica, index) => {
          console.log(`   ${index + 1}. ${clinica.titulo} (${clinica.activo ? 'Activa' : 'Inactiva'})`);
        });
        console.log();
      } else {
        console.error('❌ Error al obtener la lista de clínicas:', listResult.error);
      }
      
      // Probar cambio de estado
      console.log('🔄 Probando cambio de estado...');
      const toggleResponse = await fetch(`${API_BASE_URL}/clinicas/${clinicaId}`, {
        method: 'PATCH'
      });
      const toggleResult = await toggleResponse.json();
      
      if (toggleResponse.ok && toggleResult.success) {
        console.log('✅ Estado cambiado exitosamente!');
        console.log(`   Nuevo estado: ${toggleResult.data.activo ? 'Activa' : 'Inactiva'}\n`);
      } else {
        console.error('❌ Error al cambiar el estado:', toggleResult.error);
      }
      
      console.log('🎉 Todas las pruebas completadas exitosamente!');
      console.log(`\n🌐 Puedes ver la página generada en: http://localhost:3000/clinicas/${clinicaId}`);
      console.log(`🛠️  Panel de administración: http://localhost:3000/admin/clinicas`);
      console.log(`➕ Crear nueva clínica: http://localhost:3000/oftalmologia`);
      
    } else {
      console.error('❌ Error al crear la clínica:');
      console.error(`   Status: ${createResponse.status}`);
      console.error(`   Error: ${createResult.error || 'Error desconocido'}`);
      console.error(`   Mensaje: ${createResult.message || 'Sin mensaje'}`);
    }

  } catch (error) {
    console.error('💥 Error durante las pruebas:', error.message);
    console.error('\n📌 Asegúrate de que:');
    console.error('   1. El servidor Next.js esté ejecutándose (npm run dev)');
    console.error('   2. La base de datos Supabase esté configurada correctamente');
    console.error('   3. Las variables de entorno estén configuradas en .env.local');
  }
}

// Verificar si estamos ejecutando desde línea de comandos
if (typeof require !== 'undefined' && require.main === module) {
  testAPI();
}

module.exports = { testAPI, clinicaData };
