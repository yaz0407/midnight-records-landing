const express = require('express');
const path = require('path');
const { Pool } = require('pg');

const app = express();
const port = process.env.PORT || 3000;

const pool = process.env.DATABASE_URL
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    })
  : null;

app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/status', async (req, res) => {
  if (!pool) {
    return res.json({
      status: 'ok',
      database: 'not configured',
      message: 'Define DATABASE_URL en Railway para conectar la base de datos.',
    });
  }

  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW() AS now');
    client.release();

    return res.json({
      status: 'ok',
      database: 'connected',
      serverTime: result.rows[0].now,
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      error: error.message,
    });
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
