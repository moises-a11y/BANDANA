const express = require('express');
const mp = require('../services/mercadoPago');
const {
  parseReleaseReport,
  filterRows,
  summarizeReleaseReport,
} = require('../services/reportParser');

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
// Filtros opcionales: ?recordType=... y ?paymentMethod=...
// La respuesta JSON incluye totales y conteo por tipo de registro.
router.get('/:fileName', async (req, res, next) => {
  try {
    const csv = await mp.downloadReleaseReport(req.params.fileName);
    if (req.query.format === 'csv') {
      res.type('text/csv').send(csv);
      return;
    }
    const parsed = parseReleaseReport(csv);
    const rows = filterRows(parsed.rows, {
      recordType: req.query.recordType,
      paymentMethod: req.query.paymentMethod,
    });
    res.json({
      headers: parsed.headers,
      summary: summarizeReleaseReport(rows),
      count: rows.length,
      rows,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
