const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const pool = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

/* ===============================
   LOGIN
=================================*/
app.post('/login', async (req, res) => {
  try {
    let { correo, password } = req.body;

    if (!correo || !password) {
      return res.status(400).json({ error: 'Faltan datos obligatorios' });
    }

    correo = correo.toLowerCase().trim();

    const result = await pool.query(
      'SELECT * FROM usuarios WHERE correo = $1',
      [correo]
    );

    if (result.rowCount === 0) {
      return res.status(401).json({ error: 'Usuario no encontrado' });
    }

    const user = result.rows[0];

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Contraseña incorrecta' });
    }

    res.json({
      ok: true,
      id: user.id,
      nombre: user.nombre_completo,
      rol: user.rol
    });

  } catch (error) {
    console.error("LOGIN ERROR:", error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

/* ===============================
   REGISTER
=================================*/
app.post('/register', async (req, res) => {
  try {
    let {
      nombre_completo,
      numero_reloj,
      rol,
      linea_trabajo,
      lineas_a_cargo,
      departamento,
      correo,
      password
    } = req.body;

    if (!nombre_completo || !numero_reloj || !rol || !correo || !password) {
      return res.status(400).json({ error: 'Faltan datos obligatorios' });
    }

    nombre_completo = String(nombre_completo).trim();
    numero_reloj = String(numero_reloj).trim();
    correo = String(correo).toLowerCase().trim();

    const rolesPermitidos = ['operador', 'supervisor', 'rrhh', 'jefe_grupo'];
    if (!rolesPermitidos.includes(rol)) {
      return res.status(400).json({ error: 'Rol inválido' });
    }

    const existing = await pool.query(
      'SELECT id FROM usuarios WHERE correo = $1 OR numero_reloj = $2',
      [correo, numero_reloj]
    );

    if (existing.rowCount > 0) {
      return res.status(409).json({
        error: 'El correo o número de reloj ya está registrado'
      });
    }

    const hash = await bcrypt.hash(password, 10);

    const insertResult = await pool.query(
      `INSERT INTO usuarios
       (nombre_completo, numero_reloj, rol, linea_trabajo,
        lineas_a_cargo, departamento, correo, password)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
       RETURNING id`,
      [
        nombre_completo,
        numero_reloj,
        rol,
        linea_trabajo || null,
        lineas_a_cargo || null,
        departamento || null,
        correo,
        hash
      ]
    );

    res.status(201).json({
      ok: true,
      message: 'Usuario registrado correctamente',
      id: insertResult.rows[0].id
    });

  } catch (error) {
    console.error("REGISTER ERROR:", error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

/* ===============================
   OPERADORES POR LÍNEA
=================================*/
app.get('/operadores/:linea', async (req, res) => {
  try {

    const { linea } = req.params;

    const result = await pool.query(
      `SELECT id, nombre_completo, numero_reloj, linea_trabajo
       FROM usuarios
       WHERE rol = 'operador'
       AND LOWER(unaccent(linea_trabajo)) =
           LOWER(unaccent($1))`,
      [linea]
    );

    res.json(result.rows);

  } catch (error) {
    console.error("OPERADORES ERROR:", error);
    res.status(500).json({ error: 'Error al obtener operadores' });
  }
});

/* ===============================
   CAMBIAR CONTRASEÑA
=================================*/
app.post('/change-password', async (req, res) => {
  try {

    let { correo, currentPassword, newPassword } = req.body;

    if (!correo || !currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Faltan datos obligatorios' });
    }

    correo = correo.toLowerCase().trim();

    const result = await pool.query(
      'SELECT * FROM usuarios WHERE correo = $1',
      [correo]
    );

    if (result.rowCount === 0) {
      return res.status(401).json({ error: 'Usuario no encontrado' });
    }

    const user = result.rows[0];

    const validPassword = await bcrypt.compare(currentPassword, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Contraseña actual incorrecta' });
    }

    const hash = await bcrypt.hash(newPassword, 10);

    await pool.query(
      'UPDATE usuarios SET password = $1 WHERE correo = $2',
      [hash, correo]
    );

    res.json({
      ok: true,
      message: 'Contraseña actualizada correctamente'
    });

  } catch (error) {
    console.error("CHANGE PASSWORD ERROR:", error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

/* ===============================
   START SERVER
=================================*/
const PORT = 3000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`API corriendo en puerto ${PORT}`);
});
