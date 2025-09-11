// Script para crear administrador usando fetch a nuestra propia API
async function createAdminTest() {
  console.log('🧪 Creando administrador via API local...');

  try {
    const response = await fetch('http://localhost:3000/api/admin/empresas', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@test.com',
        nombre: 'Admin Test',
        password: '123456',
        empresa_id: 1,
        permisos: {
          puede_editar_info_basica: true,
          puede_editar_contacto: true,
          puede_editar_modal: true,
          puede_editar_categorias: true,
          puede_editar_sucursales: true,
          puede_editar_contenido_hero: true,
          puede_editar_videos: true
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error HTTP:', response.status, errorText);
      return;
    }

    const result = await response.json();
    console.log('✅ Administrador creado exitosamente:', result);
    console.log('');
    console.log('🎉 ¡Listo para usar!');
    console.log('📧 Email: admin@test.com');
    console.log('🔐 Password: 123456');
    console.log('🏢 Empresa ID: 1');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

createAdminTest();
