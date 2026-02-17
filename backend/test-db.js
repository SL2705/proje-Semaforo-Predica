
const pool = require('./db');


pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    
    console.error(err);
  } else {
  
    console.log('Conectado:', res.rows[0]);
  }
  
  
  pool.end();
});
