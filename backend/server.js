const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const { pool, supabase } = require('./db');
const PDFDocument = require('pdfkit');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
console.log("SERVER START");

// ===============================
//  ACEPTAR SUSPENSIÓN (RH)
// ===============================
app.post('/suspensiones/aceptar', async (req, res) => {
  try {
    const { numero_reloj } = req.body;
    if (!numero_reloj) return res.status(400).json({ error: 'Falta numero_reloj' });

    // Bloquear usuario
    await pool.query(
      `UPDATE usuarios SET bloqueado = true WHERE numero_reloj = $1`,
      [numero_reloj]
    );
    // Cambiar estado de suspensión a SUSPENDIDO
    await pool.query(
      `UPDATE suspensiones SET estado = 'SUSPENDIDO' WHERE reloj_operador = $1 AND estado = 'PENDIENTE RH'`,
      [numero_reloj]
    );
    res.json({ ok: true });
  } catch (error) {
    console.error('ERROR aceptando suspensión:', error);
    res.status(500).json({ error: 'Error aceptando suspensión' });
  }
});

// ===============================
//  RECHAZAR SUSPENSIÓN (RH)
// ===============================
app.post('/suspensiones/rechazar', async (req, res) => {
  try {
    const { numero_reloj } = req.body;
    if (!numero_reloj) return res.status(400).json({ error: 'Falta numero_reloj' });

    // Reactivar usuario y quitarle estado de suspensión
    await pool.query(
      `UPDATE usuarios SET bloqueado = false, estado = 'ACTIVO' WHERE numero_reloj = $1`,
      [numero_reloj]
    );

    // Marcar como rechazada cualquier suspensión pendiente o ya suspendida
    await pool.query(
      `UPDATE suspensiones
       SET estado = 'RECHAZADA', updated_at = NOW()
       WHERE reloj_operador = $1 AND estado IN ('PENDIENTE RH', 'SUSPENDIDO')`,
      [numero_reloj]
    );

    res.json({ ok: true });
  } catch (error) {
    console.error('ERROR rechazando suspensión:', error);
    res.status(500).json({ error: 'Error rechazando suspensión' });
  }
});

/* ===============================
   USUARIOS SUSPENDIDOS
=================================*/
app.get('/usuarios-suspendidos', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT u.id, u.nombre_completo, u.numero_reloj, u.rol, u.linea_trabajo, u.departamento, s.fecha_inicio, s.fecha_fin, s.motivo
      FROM usuarios u
      INNER JOIN suspensiones s ON u.numero_reloj = s.reloj_operador
      WHERE s.estado = 'SUSPENDIDO'
      ORDER BY s.fecha_inicio DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('ERROR obteniendo usuarios suspendidos:', error);
    res.status(500).json({ error: 'Error obteniendo usuarios suspendidos' });
  }
});
/* ===============================
   ASISTENCIA DE HOY POR USUARIO
=================================*/
app.get('/asistencia-hoy/:numero_reloj', async (req, res) => {
  try {
    const { numero_reloj } = req.params;
    const result = await pool.query(`
      SELECT * FROM asistencias
      WHERE numero_reloj = $1 AND fecha = CURRENT_DATE
      LIMIT 1
    `, [numero_reloj]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'No hay registro de asistencia para hoy.' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error obteniendo asistencia de hoy:', error);
    res.status(500).json({ error: 'Error obteniendo asistencia de hoy' });
  }
});

/* ===============================
   HISTORIAL DE ASISTENCIAS POR USUARIO
=================================*/
app.get('/asistencias/:numero_reloj', async (req, res) => {
  try {
    const { numero_reloj } = req.params;
    const result = await pool.query(`
      SELECT id, numero_reloj, fecha, asistencia, puntualidad, registrado_por, fecha_registro
      FROM asistencias
      WHERE numero_reloj = $1
      ORDER BY fecha DESC, id DESC
      LIMIT 10
    `, [numero_reloj]);
    res.json(result.rows);
  } catch (error) {
    console.error('Error obteniendo historial de asistencias:', error);
    res.status(500).json({ error: 'Error obteniendo historial de asistencias' });
  }
});

/* ===============================
   LOGIN
=================================*/
app.post('/login', async (req, res) => {
  try { 

    let { numeroReloj, password } = req.body;

    if (!numeroReloj || !password) {
      return res.status(400).json({ error: 'Faltan datos obligatorios' });
    }

    numeroReloj = String(numeroReloj).trim();
    // 1. Buscar usuario
    const result = await pool.query(
      'SELECT * FROM usuarios WHERE numero_reloj = $1',
      [numeroReloj]
    );

    // 2. Validar existencia
    if (result.rowCount === 0) {
      return res.status(401).json({ error: 'Usuario no encontrado' });
    }

    const user = result.rows[0];

    // 3. BLOQUEO CRÍTICO (aquí es donde va)
    if (user.bloqueado === true) {
      return res.status(403).json({
        error: 'Usuario suspendido. Contacta con RH.'
      });
    }

    // 4. Validar contraseña
    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(401).json({ error: 'Contraseña incorrecta' });
    }

    // 5. Respuesta exitosa
    res.json({
      ok: true,
      id: user.id,
      nombre: user.nombre_completo,
      rol: user.rol,
      numero_reloj: user.numero_reloj
    });

  } catch (error) {
    console.error("LOGIN ERROR:", error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    const { error } = await supabase.from('usuarios').select('id').limit(1);
    if (error) {
      throw error;
    }
    res.json({ ok: true, local: 'postgres_ok', supabase: 'ok' });
  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({ ok: false, local: 'postgres_error', supabase: 'supabase_error', message: error.message });
  }
});



app.get('/test-supabase', async (req, res) => {
  try {
    const { data, error } = await supabase.from('usuarios').select('*').limit(5);
    if (error) {
      throw error;
    }
    res.json({ success: true, data, count: data.length });
  } catch (error) {
    console.error('Supabase test error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

async function insertarUsuario(data) {
  // 1. Guardar en local
  await pool.query(
    `INSERT INTO usuarios (nombre_completo, numero_reloj, rol, password)
     VALUES ($1,$2,$3,$4)`,
    [data.nombre, data.reloj, data.rol, data.password]
  );

  // 2. Guardar en Supabase (copia web)
  try {
    const { error } = await supabase.from('usuarios').insert([
      {
        nombre_completo: data.nombre,
        numero_reloj: data.reloj,
        rol: data.rol,
        password: data.password
      }
    ]);

    if (error) {
      console.error('Error guardando usuario en Supabase:', error);
    }
  } catch (supabaseError) {
    console.error('Excepción Supabase al insertar usuario:', supabaseError);
  }
}

/* ===============================
   OBTENER TODOS LOS USUARIOS
=================================*/
app.get('/usuarios', async (req, res) => {
  try {
    // Fetch users and left join with suspensiones to get estado
    const result = await pool.query(
      `SELECT 
         u.id, 
         u.nombre_completo, 
         u.numero_reloj, 
         u.rol, 
         u.linea_trabajo, 
         u.lineas_a_cargo, 
         u.departamento,
         COALESCE(s.estado, 'ACTIVO') as estado
       FROM usuarios u
       LEFT JOIN (
         SELECT reloj_operador, estado
         FROM suspensiones
         WHERE estado = 'PENDIENTE RH' OR estado = 'SUSPENDIDO'
       ) s ON u.numero_reloj = s.reloj_operador
       ORDER BY u.id ASC`
    );


    // For each user, count faltas and retardos in asistencias
    const userPromises = result.rows.map(async user => {
      // Get asistencias for this user
      const asistenciasResult = await pool.query(
        `SELECT puntualidad FROM asistencias WHERE numero_reloj = $1`,
        [user.numero_reloj]
      );
      const asistencias = asistenciasResult.rows;
      const faltas = asistencias.filter(a => a.puntualidad === 'FALTA').length;
      const retardos = asistencias.filter(a => a.puntualidad === 'RETARDO').length;
      let semaforo = 'verde';
      if (faltas >= 3) {
        semaforo = 'rojo';
      } else if (retardos >= 2) {
        semaforo = 'amarillo';
      }
      return {
        ...user,
        semaforo
      };
    });
    const users = await Promise.all(userPromises);
    res.json(users);

  } catch (error) {
    console.error("ERROR OBTENIENDO USUARIOS:", error);
    res.status(500).json({ error: 'Error obteniendo usuarios' });
  }
});

app.post('/vacaciones', async (req, res) => {

  const {
    numero_reloj,
    fecha_inicio,
    fecha_fin,
    dias,
    comentario
  } = req.body;

  try {

    // ✅ VALIDACIONES
    if (!numero_reloj || !fecha_inicio || !fecha_fin) {
      return res.status(400).send('Faltan datos obligatorios');
    }

    if (dias <= 0) {
      return res.status(400).send('Días inválidos');
    }

    // ✅ VALIDAR QUE NO SE ENCIMEN VACACIONES
    const existe = await pool.query(
      `SELECT * FROM vacaciones 
       WHERE numero_reloj = $1 
       AND estado = 'APROBADO'
       AND (
         fecha_inicio BETWEEN $2 AND $3 OR
         fecha_fin BETWEEN $2 AND $3
       )`,
      [numero_reloj, fecha_inicio, fecha_fin]
    );

    if (existe.rows.length > 0) {
      return res.status(400).send('Ya tiene vacaciones en esas fechas');
    }

    // ✅ INSERTAR
    const estado = 'APROBADO';
    const fecha_registro = new Date();
    const result = await pool.query(
      `INSERT INTO vacaciones 
      (numero_reloj, fecha_inicio, fecha_fin, dias, comentario, estado, fecha_registro) 
      VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [numero_reloj, fecha_inicio, fecha_fin, dias, comentario, estado, fecha_registro]
    );

    res.json(result.rows[0]);

  } catch (error) {
    console.error(error);
    res.status(500).send('Error al registrar vacaciones');
  }

});
/* ===============================
   ASISTENCIAS DE HOY 🔥
=================================*/
app.get('/asistencias-hoy', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT numero_reloj, asistencia, puntualidad, fecha
      FROM asistencias
      WHERE fecha = CURRENT_DATE
    `);

    console.log("DATOS BD:", result.rows); // 🔥 DEBUG

    res.json(result.rows);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error obteniendo asistencias' });
  }
});

/* ===============================
   REGISTRAR PERMISO
=================================*/
app.post('/permisos', async (req, res) => {
  try {
    const { numero_reloj, fecha, hora_inicio, hora_fin, tipo, motivo } = req.body;

    if (!numero_reloj || !fecha || !hora_inicio || !hora_fin || !tipo || !motivo) {
      return res.status(400).json({ error: 'Faltan datos obligatorios' });
    }

    const fecha_registro = new Date();
    const estatus = 'PENDIENTE';
    const aprobado_por = null;

    const result = await pool.query(
      `INSERT INTO permisos (numero_reloj, fecha, hora_inicio, hora_fin, tipo, motivo, estatus, aprobado_por, fecha_registro)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
      [numero_reloj, fecha, hora_inicio, hora_fin, tipo, motivo, estatus, aprobado_por, fecha_registro]
    );

    res.json(result.rows[0]);

  } catch (error) {
    console.error('Error al registrar permiso:', error);
    res.status(500).json({ error: 'Error al registrar permiso' });
  }
});

/* ===============================
   ACTUALIZAR ASISTENCIA (BOTÓN)
=================================*/
app.post('/asistencia/corregir', async (req, res) => {
  console.log("🔥 RUTA CORREGIR ACTIVA POST");
  try {

    const { numero_reloj, puntualidad, registrado_por } = req.body;

    const fechaHoy = new Date().toISOString().split('T')[0];

    let asistencia = puntualidad !== 'FALTA';

    // 🔎 Verificar si ya existe
    const existe = await pool.query(
      `SELECT id FROM asistencias
       WHERE numero_reloj = $1 AND fecha = $2`,
      [numero_reloj, fechaHoy]
    );

    if (existe.rowCount > 0) {

      // ✅ ACTUALIZA
      await pool.query(
        `UPDATE asistencias
         SET asistencia = $1,
             puntualidad = $2,
             registrado_por = $3,
             fecha_registro = NOW()
         WHERE numero_reloj = $4 AND fecha = $5`,
        [asistencia, puntualidad, registrado_por, numero_reloj, fechaHoy]
      );

    } else {

      // ✅ INSERTA
      await pool.query(
        `INSERT INTO asistencias
        (numero_reloj, fecha, asistencia, puntualidad, registrado_por)
        VALUES ($1,$2,$3,$4,$5)`,
        [numero_reloj, fechaHoy, asistencia, puntualidad, registrado_por]
      );

    }

    res.json({ ok: true });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al corregir asistencia' });
  }
});

app.put('/corregir-asistencia', async (req, res) => {
  console.log("🔥 RUTA CORREGIR ACTIVA PUT");
  try {
    const { numero_reloj, tipo, puntualidad, registrado_por } = req.body;
    const fechaHoy = new Date().toISOString().split('T')[0];

    const puntual = tipo || puntualidad || 'FALTA';
    const registrado = registrado_por || 'Sistema';
    const asistencia = puntual !== 'FALTA';

    const existe = await pool.query(
      `SELECT id FROM asistencias
       WHERE numero_reloj = $1 AND fecha = $2`,
      [numero_reloj, fechaHoy]
    );

    if (existe.rowCount > 0) {
      await pool.query(
        `UPDATE asistencias
         SET asistencia = $1,
             puntualidad = $2,
             registrado_por = $3,
             fecha_registro = NOW()
         WHERE numero_reloj = $4 AND fecha = $5`,
        [asistencia, puntual, registrado, numero_reloj, fechaHoy]
      );
    } else {
      await pool.query(
        `INSERT INTO asistencias
        (numero_reloj, fecha, asistencia, puntualidad, registrado_por)
        VALUES ($1,$2,$3,$4,$5)`,
        [numero_reloj, fechaHoy, asistencia, puntual, registrado]
      );
    }

    res.json({ ok: true });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al corregir asistencia' });
  }
});

app.put('/cancelar-excepcion', async (req, res) => {

  const { numero_reloj } = req.body;

  try {

    await pool.query(`
      DELETE FROM excepciones
      WHERE numero_reloj = $1
    `, [numero_reloj]);

    await pool.query(`
      UPDATE operadores
      SET estado = 'PENDIENTE'
      WHERE numero_reloj = $1
    `, [numero_reloj]);

    res.send('OK');

  } catch (err) {
    res.status(500).send('Error');
  }

});

/* ===============================
   REGISTRAR INCAPACIDAD
=================================*/
app.post('/incapacidades', async (req, res) => {
  try {
    const { numero_reloj, fecha_inicio, fecha_fin, tipo, documento, registrado_por } = req.body;

    if (!numero_reloj || !fecha_inicio || !fecha_fin || !tipo) {
      return res.status(400).json({ error: 'Faltan datos obligatorios para incapacidad' });
    }

    const fecha_registro = new Date();

    const result = await pool.query(
      `INSERT INTO incapacidades
       (numero_reloj, fecha_inicio, fecha_fin, tipo, documento, registrado_por, fecha_registro)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [numero_reloj, fecha_inicio, fecha_fin, tipo, documento || null, registrado_por || 'Supervisor', fecha_registro]
    );

    res.json(result.rows[0]);

  } catch (error) {
    console.error('ERROR INCAPACIDADES:', error);
    res.status(500).json({ error: 'Error al registrar incapacidad' });
  }
});


/* ===============================
   REGISTRAR USUARIO
=================================*/
app.post('/usuarios', async (req, res) => {
  try {

    let { rol, nombre_completo, numero_reloj, password, linea, lineas_cargo, departamento } = req.body;

    if (!rol || !nombre_completo || !numero_reloj || !password) {
      return res.status(400).json({ error: 'Faltan datos obligatorios' });
    }

    linea = linea || null;
    lineas_cargo = lineas_cargo || null;
    departamento = departamento || null;

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO usuarios
      (rol, nombre_completo, numero_reloj, password, linea_trabajo, lineas_a_cargo, departamento)
      VALUES ($1,$2,$3,$4,$5,$6,$7)
      RETURNING id, nombre_completo, rol, numero_reloj`,
      [rol, nombre_completo, numero_reloj, hashedPassword, linea, lineas_cargo, departamento]
    );

    res.json({ ok: true, usuario: result.rows[0] });

  } catch (error) {
    console.error("ERROR REGISTRANDO USUARIO:", error);
    res.status(500).json({ error: 'Error registrando usuario' });
  }
});

/* ===============================
   ACTUALIZAR USUARIO
=================================*/
app.put('/usuarios/:id', async (req, res) => {

  const { nombre_completo, numero_reloj, rol } = req.body;
  const id = parseInt(req.params.id);

  try {

    const result = await pool.query(
      `UPDATE usuarios
       SET nombre_completo = $1,
           numero_reloj = $2,
           rol = $3
       WHERE id = $4
       RETURNING id, numero_reloj`,
      [nombre_completo, numero_reloj, rol, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json({ ok: true, usuario: result.rows[0] });

  } catch (error) {
    console.error("ERROR ACTUALIZANDO:", error);
    res.status(500).json({ error: 'Error actualizando usuario' });
  }
});

/* ===============================
   ELIMINAR USUARIO
=================================*/
app.delete('/usuarios/:id', async (req, res) => {

  try {

    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM usuarios WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json({ ok: true });

  } catch (error) {
    console.error("ERROR ELIMINANDO:", error);
    res.status(500).json({ error: 'Error eliminando usuario' });
  }
});

/* ===============================
   OPERADORES PARA JEFE
=================================*/
app.get('/operadores-jefe', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id,
             nombre_completo,
             numero_reloj,
             linea_trabajo,
             estado,
             bloqueado
      FROM usuarios
      WHERE rol = 'operador'
      ORDER BY nombre_completo ASC
    `);

    res.json(result.rows);

  } catch (error) {
    console.error("ERROR OPERADORES:", error);
    res.status(500).json({ error: 'Error obteniendo operadores' });
  }
});

/* ===============================
   REGISTRAR ASISTENCIA
=================================*/
app.post('/asistencia', async (req, res) => {

  try {

    const { numero_reloj, asistencia, puntualidad, registrado_por } = req.body;

    const fechaHoy = new Date().toISOString().split('T')[0];

    const existe = await pool.query(
      `SELECT id FROM asistencias
       WHERE numero_reloj = $1 AND fecha = $2`,
      [numero_reloj, fechaHoy]
    );

    if (existe.rowCount > 0) {
      return res.status(400).json({ error: 'Asistencia ya registrada hoy' });
    }

    await pool.query(
      `INSERT INTO asistencias
       (numero_reloj, fecha, asistencia, puntualidad, registrado_por)
       VALUES ($1,$2,$3,$4,$5)`,
      [numero_reloj, fechaHoy, asistencia, puntualidad, registrado_por]
    );

    res.json({ ok: true });

  } catch (error) {
    console.error("ERROR REGISTRANDO ASISTENCIA:", error);
    res.status(500).json({ error: 'Error registrando asistencia' });
  }
});

/* ===============================
   HISTORIAL KARDEX
=================================*/
app.get('/kardex/:numero', async (req, res) => {

  try {

    const { numero } = req.params;

    const usuario = await pool.query(
      `SELECT nombre_completo, numero_reloj, rol
       FROM usuarios
       WHERE numero_reloj = $1`,
      [numero]
    );

    if (usuario.rowCount === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const historial = await pool.query(
      `SELECT fecha,
              CASE
                WHEN asistencia = true THEN puntualidad
                ELSE 'FALTA'
              END AS estado
       FROM asistencias
       WHERE numero_reloj = $1
       ORDER BY fecha DESC`,
      [numero]
    );

    res.json({
      nombre: usuario.rows[0].nombre_completo,
      numero_reloj: usuario.rows[0].numero_reloj,
      rol: usuario.rows[0].rol,
      historial: historial.rows
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error obteniendo kardex' });
  }
});

/* ===============================
   HISTORIAL RECIENTE
=================================*/
app.get('/historial-reciente/:numero', async (req, res) => {

  try {

    const { numero } = req.params;

    const result = await pool.query(
      `SELECT fecha,
              CASE
                WHEN asistencia = true THEN puntualidad
                ELSE 'FALTA'
              END AS estado
       FROM asistencias
       WHERE numero_reloj = $1
       ORDER BY fecha DESC
       LIMIT 3`,
      [numero]
    );

    res.json(result.rows);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error obteniendo historial' });
  }
});

/* ===============================
   GENERAR KARDEX PDF
=================================*/
app.get('/kardex-pdf/:numero', async (req, res) => {

  try {

    const { numero } = req.params;

    const result = await pool.query(
      'SELECT nombre_completo, numero_reloj, rol FROM usuarios WHERE numero_reloj = $1',
      [numero]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const user = result.rows[0];

    const historial = await pool.query(
      `SELECT fecha,
              CASE
                WHEN asistencia = true THEN puntualidad
                ELSE 'FALTA'
              END AS estado
       FROM asistencias
       WHERE numero_reloj = $1
       ORDER BY fecha DESC`,
      [numero]
    );

    const doc = new PDFDocument({ margin: 40 });

    /* HEADERS PARA DESCARGAR */
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=kardex_${numero}.pdf`
    );

    doc.pipe(res);

    /* ===========================
       HEADER
    =========================== */

    const logoPath = path.join(__dirname, '..', 'src', 'assets', 'logo.png');

    doc.image(logoPath, 40, 40, { width: 45 });

    doc
      .rect(95, 40, 460, 40)
      .fill('#3c3f43');

    doc
      .fillColor('white')
      .fontSize(16)
      .text('Kardex - Control de Auditoría Operativa', 105, 52);

    doc.fillColor('black');

    /* ===========================
       INFO EMPLEADO
    =========================== */

    let y = 100;

    doc.rect(40, y, 260, 25).stroke();
    doc.rect(300, y, 255, 25).stroke();

    doc.fontSize(10)
      .text(`EMPLEADO: ${user.nombre_completo}`, 45, y + 7);

    doc.text(`ID RELOJ: ${user.numero_reloj}`, 305, y + 7);

    y += 25;

    doc.rect(40, y, 260, 25).stroke();
    doc.rect(300, y, 255, 25).stroke();

    doc.text(`PUESTO: ${user.rol}`, 45, y + 7);

    const today = new Date().toISOString().split('T')[0];

    doc.text(`FECHA REPORTE: ${today}`, 305, y + 7);

    y += 40;

    /* ===========================
       TABLA HEADER
    =========================== */

    doc.rect(40, y, 120, 25).fill('#c5c9cc');
    doc.rect(160, y, 120, 25).fill('#c5c9cc');
    doc.rect(280, y, 120, 25).fill('#c5c9cc');
    doc.rect(400, y, 155, 25).fill('#c5c9cc');

    doc.fillColor('black')
      .fontSize(10)
      .text('FECHA', 45, y + 8)
      .text('ESTADO', 165, y + 8)
      .text('SEMÁFORO', 285, y + 8)
      .text('OBSERVACIONES / INCIDENCIAS', 405, y + 8);

    y += 25;

    /* ===========================
       FILAS TABLA
    =========================== */

    historial.rows.forEach(item => {

      doc.rect(40, y, 120, 25).stroke();
      doc.rect(160, y, 120, 25).stroke();
      doc.rect(280, y, 120, 25).stroke();
      doc.rect(400, y, 155, 25).stroke();

      const fecha = new Date(item.fecha).toLocaleDateString('es-MX');

      doc.text(fecha, 45, y + 7);
      doc.text(item.estado, 165, y + 7);

      let color = '#2ecc71';
      let semaforo = 'ÓPTIMO';
      let obs = 'Ingreso registrado en tiempo y forma.';

      if (item.estado === 'RETARDO') {
        color = '#f39c12';
        semaforo = 'ADVERTENCIA';
        obs = 'Retraso registrado en la jornada.';
      }

      if (item.estado === 'FALTA') {
        color = '#c0392b';
        semaforo = 'CRÍTICO';
        obs = 'Inasistencia no justificada.';
      }

      doc.rect(285, y + 5, 80, 15).fill(color);

      doc.fillColor('white')
        .fontSize(9)
        .text(semaforo, 290, y + 7);

      doc.fillColor('black')
        .fontSize(9)
        .text(obs, 405, y + 7, { width: 145 });

      y += 25;

    });

    /* ===========================
       FOOTER
    =========================== */

    y += 20;

    doc.moveTo(40, y).lineTo(555, y).stroke();

    y += 5;

    doc.fontSize(8)
      .text(
        'Validación Técnica: Este documento es una representación fiel de los registros digitales del sistema de asistencia.',
        40,
        y,
        { width: 500 }
      );

    doc.end();

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error generando PDF' });
  }

});



app.get('/api-docs-pdf', (req, res) => {
  const doc = new PDFDocument({ margin: 40 });

  // Headers correctos para visualización en navegador
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'inline; filename="api-docs.pdf"');
  res.setHeader('Cache-Control', 'no-store');

  doc.pipe(res);

  const baseUrl = `${req.protocol}://${req.get('host')}`;

  // =========================
  // HEADER PRINCIPAL
  // =========================
  doc
    .fillColor('#2c3e50')
    .fontSize(22)
    .text('DOCUMENTACIÓN API', { align: 'center' });

  doc.moveDown(0.5);

  doc
    .fontSize(10)
    .fillColor('gray')
    .text(`Generado automáticamente - ${new Date().toLocaleString()}`, {
      align: 'center'
    });

  doc.moveDown(1);

  // =========================
  // INFO GENERAL
  // =========================
  doc
    .fillColor('#000')
    .fontSize(14)
    .text('INFORMACIÓN GENERAL', { underline: true });

  doc.fontSize(11).fillColor('#333');
  doc.text(`Base URL: ${baseUrl}`);
  doc.text('Formato: JSON');
  doc.text('Autenticación: Bearer Token (JWT)');

  doc.moveDown();

  // =========================
  // HELP BOX
  // =========================
  doc
    .rect(40, doc.y, 515, 50)
    .fill('#f4f6f7');

  doc.fillColor('#000').fontSize(10).text(
    'Todas las respuestas son en formato JSON. Los códigos HTTP indican el estado de la petición.',
    50,
    doc.y - 40
  );

  doc.moveDown(2);

  // =========================
  // ENDPOINT LOGIN
  // =========================
  doc
    .fillColor('#2980b9')
    .fontSize(14)
    .text('POST /login', { underline: true });

  doc.fillColor('#000').fontSize(11);
  doc.text('Autentica usuario y devuelve token JWT');

  doc.moveDown(0.5);

  doc.font('Courier').fontSize(10).text(
    `Request:
{
  "numeroReloj": "123",
  "password": "1234"
}`
  );

  doc.moveDown();

  // =========================
  // USUARIOS
  // =========================
  doc
    .fillColor('#27ae60')
    .fontSize(14)
    .text('GET /usuarios', { underline: true });

  doc.fillColor('#000').fontSize(11);
  doc.text('Obtiene lista completa de usuarios registrados');

  doc.moveDown(0.5);

  doc.font('Courier').fontSize(10).text(
    `Response:
[
  {
    "id": 1,
    "nombre_completo": "Juan Pérez"
  }
]`
  );

  doc.moveDown();

  // =========================
  // ASISTENCIAS
  // =========================
  doc
    .fillColor('#8e44ad')
    .fontSize(14)
    .text('GET /asistencias-hoy', { underline: true });

  doc.fillColor('#000').fontSize(11);
  doc.text('Obtiene asistencias del día actual');

  doc.moveDown();

  // =========================
  // CÓDIGOS HTTP
  // =========================
  doc
    .fillColor('#c0392b')
    .fontSize(14)
    .text('CÓDIGOS HTTP');

  doc.fontSize(11).fillColor('#000');
  doc.text('200 OK - Petición exitosa');
  doc.text('201 CREATED - Recurso creado');
  doc.text('400 BAD REQUEST - Error en datos');
  doc.text('401 UNAUTHORIZED - No autorizado');
  doc.text('500 SERVER ERROR - Error interno');

  doc.end();
});

/* ===============================
   RECURSOS HUMANOS - ENDPOINTS RH
=================================*/

// ==========================================
// 1. SOLICITUDES DE SUSPENSIÓN PENDIENTES
// ==========================================

app.get('/rrhh/solicitudes-pendientes', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        s.id,
        s.usuario_id,
        u.nombre_completo as nombre,
        u.numero_reloj as reloj,
        u.linea_trabajo as linea,
        s.motivo,
        s.estado,
        s.fecha_solicitud,
        COALESCE(s.historial, '[]'::json) as historial
      FROM solicitudes_suspension s
      JOIN usuarios u ON s.usuario_id = u.id
      WHERE s.estado = $1
      ORDER BY s.fecha_solicitud DESC
    `, ['PENDIENTE RH']);

    res.json(result.rows);
  } catch (err) {
    console.error('ERROR en /rrhh/solicitudes-pendientes:', err);
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 2. OPERADORES SUSPENDIDOS
// ==========================================

app.get('/rrhh/suspendidos', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        u.id,
        u.numero_reloj as reloj,
        u.nombre_completo as nombre,
        u.linea_trabajo as linea,
        u.estado,
        s.fecha_suspension,
        s.motivo
      FROM usuarios u
      LEFT JOIN (
        SELECT DISTINCT ON (usuario_id) 
          usuario_id, 
          fecha_solicitud as fecha_suspension,
          motivo
        FROM solicitudes_suspension
        WHERE estado = 'SUSPENDIDO'
        ORDER BY usuario_id, fecha_solicitud DESC
      ) s ON u.id = s.usuario_id
      WHERE u.estado = 'SUSPENDIDO'
      ORDER BY s.fecha_suspension DESC
    `);

    res.json(result.rows);
  } catch (err) {
    console.error('ERROR en /rrhh/suspendidos:', err);
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 3. OPERADORES CON ESTADO SEMÁFORO
// ==========================================

app.get('/rrhh/operadores-semaforo', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        u.id,
        u.numero_reloj as reloj,
        u.nombre_completo as nombre,
        u.linea_trabajo as linea,
        COALESCE(MAX(s.estado), u.estado) as estado,

        COUNT(*) FILTER (WHERE a.puntualidad = 'FALTA')::int as faltas,
        COUNT(*) FILTER (WHERE a.puntualidad = 'RETARDO')::int as retardos,

        CASE
          WHEN COUNT(*) FILTER (WHERE a.puntualidad = 'FALTA') >= 2 THEN 'rojo'
          WHEN COUNT(*) FILTER (WHERE a.puntualidad IN ('FALTA','RETARDO')) >= 1 THEN 'amarillo'
          ELSE 'verde'
        END as semaforo

      FROM usuarios u
      LEFT JOIN asistencias a 
        ON u.numero_reloj = a.numero_reloj
      LEFT JOIN suspensiones s
        ON u.numero_reloj = s.reloj_operador AND s.estado IN ('PENDIENTE RH', 'SUSPENDIDO')

      WHERE u.rol = 'operador'
      GROUP BY u.id, u.numero_reloj, u.nombre_completo, u.linea_trabajo, u.estado
      ORDER BY semaforo DESC
    `);

    res.json(result.rows);

  } catch (err) {
    console.error('ERROR SEMAFORO:', err);
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 4. CAMBIAR CONTRASEÑA
// ==========================================

app.put('/cambiar-contrasena', async (req, res) => {
  try {
    const { usuarioId, passwordActual, passwordNueva } = req.body;

    if (!usuarioId || !passwordActual || !passwordNueva) {
      return res.status(400).json({ error: 'Faltan datos obligatorios' });
    }

    // Validar longitud mínima
    if (passwordNueva.length < 8) {
      return res.status(400).json({ error: 'La contraseña debe tener mínimo 8 caracteres' });
    }

    // Obtener usuario
    const userResult = await pool.query(
      'SELECT * FROM usuarios WHERE id = $1',
      [usuarioId]
    );

    if (userResult.rowCount === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const user = userResult.rows[0];

    // Verificar contraseña actual
    const validPassword = await bcrypt.compare(passwordActual, user.password);

    if (!validPassword) {
      return res.status(401).json({ error: 'Contraseña actual incorrecta' });
    }

    // Evitar usar la misma contraseña
    const samePassword = await bcrypt.compare(passwordNueva, user.password);
    if (samePassword) {
      return res.status(400).json({ error: 'La nueva contraseña debe ser diferente' });
    }

    // Hashear y guardar nueva contraseña
    const hashedPassword = await bcrypt.hash(passwordNueva, 10);

    await pool.query(
      'UPDATE usuarios SET password = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [hashedPassword, usuarioId]
    );

    res.json({
      ok: true,
      mensaje: 'Contraseña actualizada exitosamente'
    });

  } catch (err) {
    console.error('ERROR en /cambiar-contrasena:', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/suspensiones', async (req, res) => {
  try {
    const { numero_reloj, motivo, enviado_por, bloquear_cuenta } = req.body;

    if (!numero_reloj || !motivo) {
      return res.status(400).json({ ok: false, message: 'Faltan datos obligatorios' });
    }


    // Bloquear la cuenta en el usuario si es necesario
    const result = await pool.query(
      `UPDATE usuarios
       SET bloqueado = $1,
           estado = $2
       WHERE numero_reloj = $3
       RETURNING id, nombre_completo, numero_reloj`,
      [bloquear_cuenta === true, 'SUSPENDIDO', numero_reloj]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ ok: false, message: 'Operador no encontrado' });
    }

    // Intentar guardar la solicitud de suspensión en la tabla de suspensiones si existe.
    try {
      await pool.query(
        `INSERT INTO suspensiones (reloj_operador, motivo, enviado_por, fecha_solicitud)
         VALUES ($1, $2, $3, NOW())`,
        [numero_reloj, motivo, enviado_por]
      );
    } catch (err) {
      if (err.code !== '42P01') {
        console.error('Error guardando solicitud de suspensión:', err);
      }
    }

    res.json({ ok: true, message: 'Suspensión registrada', operador: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, message: 'Error en suspensión' });
  }
});

// ==========================================
// 5. APROBAR SUSPENSIÓN
// ==========================================

app.put('/rrhh/solicitud/:id/aprobar', async (req, res) => {
  try {
    const { id } = req.params;

    // Actualizar solicitud
    const result = await pool.query(
      `UPDATE solicitudes_suspension 
       SET estado = $1, aprobada_por = $2, fecha_aprobacion = CURRENT_TIMESTAMP
       WHERE id = $3
       RETURNING usuario_id`,
      ['SUSPENDIDO', req.body.usuarioId || null, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Solicitud no encontrada' });
    }

    const usuarioId = result.rows[0].usuario_id;

    // Actualizar estado del usuario a SUSPENDIDO
    await pool.query(
      'UPDATE usuarios SET estado = $1 WHERE id = $2',
      ['SUSPENDIDO', usuarioId]
    );

    res.json({
      ok: true,
      mensaje: 'Suspensión aprobada',
      usuarioId
    });

  } catch (err) {
    console.error('ERROR en /rrhh/solicitud/:id/aprobar:', err);
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 6. RECHAZAR SUSPENSIÓN
// ==========================================

app.put('/rrhh/solicitud/:id/rechazar', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `UPDATE solicitudes_suspension 
       SET estado = $1, rechazada_por = $2, fecha_rechazo = CURRENT_TIMESTAMP
       WHERE id = $3
       RETURNING usuario_id`,
      ['RECHAZADA', req.body.usuarioId || null, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Solicitud no encontrada' });
    }

    res.json({
      ok: true,
      mensaje: 'Solicitud rechazada'
    });

  } catch (err) {
    console.error('ERROR en /rrhh/solicitud/:id/rechazar:', err);
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 7. REESTABLECER OPERADOR (Quitar Suspensión)
// ==========================================

app.put('/rrhh/operador/:id/reestablecer', async (req, res) => {
  try {
    const { id } = req.params;

    // Actualizar estado del usuario
    const result = await pool.query(
      'UPDATE usuarios SET estado = $1 WHERE id = $2 RETURNING id',
      ['ACTIVO', id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Registrar en solicitudes_suspension que fue reestablecido
    await pool.query(
      `UPDATE solicitudes_suspension 
       SET estado = $1, fecha_reestablecimiento = CURRENT_TIMESTAMP
       WHERE usuario_id = $2 AND estado = 'SUSPENDIDO'`,
      ['REESTABLECIDO', id]
    );

    res.json({
      ok: true,
      mensaje: 'Operador reestablecido exitosamente'
    });

  } catch (err) {
    console.error('ERROR en /rrhh/operador/:id/reestablecer:', err);
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 7B. DEBUG - VER DATOS DE USUARIOS Y ASISTENCIAS
// ==========================================

app.get('/rrhh/reporte/debug', async (req, res) => {
  try {
    const usuarios = await pool.query(`
      SELECT numero_reloj, nombre_completo, nombre, rol, estado, linea_trabajo, linea
      FROM usuarios
      LIMIT 5
    `);

    const asistencias = await pool.query(`
      SELECT numero_reloj, puntualidad, fecha
      FROM asistencias
      ORDER BY fecha DESC
      LIMIT 10
    `);

    const operadoresActivos = await pool.query(`
      SELECT COUNT(*) as total
      FROM usuarios
      WHERE rol = 'operador' AND estado = 'ACTIVO'
    `);

    res.json({
      usuarios_muestra: usuarios.rows,
      asistencias_muestra: asistencias.rows,
      operadores_activos: operadoresActivos.rows[0],
      nota: 'Esto es solo debugging, revisa los campos reales de tu BD'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 8. GENERAR REPORTE (SINCRONIZADO CON SEMÁFORO)
// ==========================================

app.get('/rrhh/reporte/generar', async (req, res) => {
  try {
    const { filtro } = req.query;

    if (!filtro || !['rojo', 'amarillo', 'verde'].includes(String(filtro))) {
      return res.status(400).json({ error: 'Filtro inválido' });
    }

    // Primero, obtener todos los operadores CON su semáforo calculado
    const result = await pool.query(`
      SELECT 
        u.id,
        u.numero_reloj,
        u.nombre_completo,
        u.linea_trabajo,
        u.estado,
        COUNT(*) FILTER (WHERE a.puntualidad = 'FALTA')::int as faltas,
        COUNT(*) FILTER (WHERE a.puntualidad = 'RETARDO')::int as retardos,
        CASE
          WHEN COUNT(*) FILTER (WHERE a.puntualidad = 'FALTA') >= 2 THEN 'rojo'
          WHEN COUNT(*) FILTER (WHERE a.puntualidad IN ('FALTA','RETARDO')) >= 1 THEN 'amarillo'
          ELSE 'verde'
        END as semaforo
      FROM usuarios u
      LEFT JOIN asistencias a 
        ON u.numero_reloj = a.numero_reloj
      WHERE u.rol = 'operador'
      GROUP BY u.id, u.numero_reloj, u.nombre_completo, u.linea_trabajo, u.estado
    `);

    // Filtrar en memoria por el semáforo
    const datos = result.rows.filter(row => row.semaforo === filtro);

    res.json({
      ok: true,
      filtro,
      total: datos.length,
      fecha_generacion: new Date().toISOString(),
      todos_operadores: result.rows.length,
      desglose: {
        rojo: result.rows.filter(r => r.semaforo === 'rojo').length,
        amarillo: result.rows.filter(r => r.semaforo === 'amarillo').length,
        verde: result.rows.filter(r => r.semaforo === 'verde').length
      },
      datos
    });

  } catch (err) {
    console.error('ERROR REPORTE:', err);
    res.status(500).json({ error: err.message });
  }
});

/* ===============================
   START SERVER
=================================*/

const PORT = 3001;

app.get('/testpath', (req, res) => {
  res.json({ ok: true, source: 'root-backend' });
});

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor corriendo en puerto ${PORT} desde ${process.cwd()}`);
});

// Manejo de errores
server.on('error', (err) => {
  console.error('❌ ERROR del servidor:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Promesa rechazada no capturada:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('❌ Excepción no capturada:', err);
});