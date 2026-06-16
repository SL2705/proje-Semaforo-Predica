require('dotenv').config();
const { Pool } = require('pg');
const { createClient } = require('@supabase/supabase-js');

const pool = new Pool({
  user: process.env.PG_USER || 'postgres',
  host: process.env.PG_HOST || 'localhost',
  database: process.env.PG_DATABASE || 'semaforo',
  password: process.env.PG_PASSWORD || '123456',
  port: Number(process.env.PG_PORT || 5432),
});

const supabaseUrl = process.env.SUPABASE_URL || 'https://ohkkupbngugfcevnkdbr.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY || 'sb_publishable_V9XaAhg5D9Ufv--MK7v_tA_l63_Y9rO';

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = {
  pool,
  supabase
};
