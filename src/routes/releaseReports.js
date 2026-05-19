const express = require('express');
const mp = require('../services/mercadoPago');
const { parseReleaseReport } = require('../services/reportParser');

const router = express.Router();

// Genera un nuevo reporte de liberación para un rango de fechas.
router.post('/', async (req, res, next) => {
  try {
    const { beginDate, endDate } = req.body;
    if (!beginDate || !endDate) {
      res.status(400).json({ error: 'beginDate y endDate son obligatorios (formato ISO 8601)' });
      return;
    }
    const result = await mp.generateReleaseReport({ beginDate, endDate });
    res.status(202).json(result ?? { status: 'solicitado' });
  } catch (err) {
    next(err);
  }
});

// Lista los reportes de liberación generados.
router.get('/', async (req, res, next) => {
  try {
    res.json(await mp.listReleaseReports());
  } catch (err) {
    next(err);
  }
});

// Devuelve la configuración del reporte de liberación.
router.get('/config', async (req, res, next) => {
  try {
    res.json(await mp.getReleaseReportConfig());
  } catch (err) {
    next(err);
  }
});

// Descarga un reporte. Con ?format=csv devuelve el CSV crudo; si no, JSON parseado.
router.get('/:fileName', async (req, res, next) => {
  try {
    const csv = await mp.downloadReleaseReport(req.params.fileName);
    if (req.query.format === 'csv') {
      res.type('text/csv').send(csv);
      return;
    }
    res.json(parseReleaseReport(csv));
  } catch (err) {
    next(err);
  }
});

module.exports = router;
