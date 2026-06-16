require('dotenv').config();
const { supabase } = require('./db');

async function checkEnumValues() {
  console.log('Verificando valores permitidos del enum rol_usuario...\n');

  // Intentar diferentes valores comunes
  const possibleValues = ['admin', 'user', 'supervisor', 'operator', 'manager', 'employee'];

  for (const value of possibleValues) {
    try {
      const { error } = await supabase
        .from('usuarios')
        .insert([{
          nombre_completo: `Test ${value}`,
          numero_reloj: `test_${value}`,
          rol: value,
          password: 'test123'
        }]);

      if (!error) {
        console.log(`✅ '${value}' es válido`);
        // Limpiar el registro de prueba
        await supabase.from('usuarios').delete().eq('numero_reloj', `test_${value}`);
      } else {
        console.log(`❌ '${value}' no es válido: ${error.message}`);
      }
    } catch (err) {
      console.log(`❌ Error con '${value}': ${err.message}`);
    }
  }
}

checkEnumValues();