const express = require('express');
const config = require('./config');
const releaseReportsRouter = require('./routes/releaseReports');

const app = express();
app.use(express.json());

app.get('/health', (req, res) => res.json({ status: 'ok' }));
app.use('/api/release-reports', releaseReportsRouter);

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  if (err.name === 'MercadoPagoError') {
    res.status(err.status || 502).json({ error: err.message, detail: err.detail });
    return;
  }
  console.error(err);
  res.status(500).json({ error: 'Error interno del servidor' });
});

app.listen(config.port, () => {
  console.log(`Servidor escuchando en http://localhost:${config.port}`);
});
