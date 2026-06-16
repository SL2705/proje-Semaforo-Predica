require('dotenv').config();
const { supabase } = require('./db');

async function testInsert() {
  console.log('Probando inserción de usuario...\n');

  // Datos de prueba
  const testUser = {
    nombre_completo: 'Usuario Prueba',
    numero_reloj: '99999',
    rol: 'sistemas', 
    linea_trabajo: null,
    lineas_a_cargo: null,
    departamento: 'Sistemas',
    password: 'test123'
  };

  try {
    const { data, error } = await supabase
      .from('usuarios')
      .insert([testUser]);

    if (error) {
      console.log('❌ Error de inserción:', error.message);
      console.log('Código de error:', error.code);
      console.log('Detalles:', error.details);
    } else {
      console.log('✅ Usuario insertado correctamente:', data);
    }
  } catch (err) {
    console.log('❌ Error inesperado:', err.message);
  }
}

testInsert();