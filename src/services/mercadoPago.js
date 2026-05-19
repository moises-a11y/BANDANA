const config = require('../config');

const { accessToken, baseUrl } = config.mercadoPago;
const RELEASE_REPORT_PATH = '/v1/account/release_report';

class MercadoPagoError extends Error {
  constructor(message, status, detail) {
    super(message);
    this.name = 'MercadoPagoError';
    this.status = status;
    this.detail = detail;
  }
}

async function mpRequest(path, { method = 'GET', body, raw = false } = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const payload = await response.text();

  if (!response.ok) {
    throw new MercadoPagoError(
      `Mercado Pago respondió ${response.status} en ${path}`,
      response.status,
      payload,
    );
  }

  if (raw) return payload;
  return payload ? JSON.parse(payload) : null;
}

// Genera manualmente un reporte de liberación para un rango de fechas (ISO 8601).
function generateReleaseReport({ beginDate, endDate }) {
  return mpRequest(RELEASE_REPORT_PATH, {
    method: 'POST',
    body: { begin_date: beginDate, end_date: endDate },
  });
}

// Lista los reportes de liberación ya generados.
function listReleaseReports() {
  return mpRequest(`${RELEASE_REPORT_PATH}/list`);
}

// Descarga el contenido CSV de un reporte concreto.
function downloadReleaseReport(fileName) {
  return mpRequest(`${RELEASE_REPORT_PATH}/${encodeURIComponent(fileName)}`, { raw: true });
}

// Obtiene la configuración actual del reporte de liberación.
function getReleaseReportConfig() {
  return mpRequest(`${RELEASE_REPORT_PATH}/config`);
}

module.exports = {
  MercadoPagoError,
  generateReleaseReport,
  listReleaseReports,
  downloadReleaseReport,
  getReleaseReportConfig,
};
