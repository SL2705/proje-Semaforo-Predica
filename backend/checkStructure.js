require('dotenv').config();
const { supabase } = require('./db');

async function checkTableStructure() {
  console.log('Verificando estructura de tablas en Supabase...\n');

  const tables = ['usuarios', 'permisos'];

  for (const table of tables) {
    try {
      console.log(`📋 Tabla: ${table}`);

      // Obtener estructura de la tabla
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1);

      if (error) {
        console.log(`❌ Error: ${error.message}`);
      } else {
        console.log('✅ Estructura OK');
        if (data && data.length > 0) {
          console.log('   Columnas detectadas:', Object.keys(data[0]));
        }
      }

      console.log('');
    } catch (err) {
      console.log(`❌ Error inesperado: ${err.message}\n`);
    }
  }
}

checkTableStructure();