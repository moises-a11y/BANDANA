// Mapeo de las columnas del Reporte de Liberación de Mercado Pago:
// encabezado del CSV -> { clave legible, etiqueta en español }.
const COLUMN_MAP = {
  RELEASE_DATE: { key: 'fechaDeLiberacion', label: 'FECHA DE LIBERACIÓN' },
  SOURCE_ID: { key: 'idOperacionMercadoPago', label: 'ID DE OPERACIÓN EN MERCADO PAGO' },
  EXTERNAL_REFERENCE: { key: 'numeroDeIdentificacion', label: 'NÚMERO DE IDENTIFICACIÓN' },
  RECORD_TYPE: { key: 'tipoDeRegistro', label: 'TIPO DE REGISTRO' },
  DESCRIPTION: { key: 'descripcion', label: 'DESCRIPCIÓN' },
  NET_CREDIT_AMOUNT: { key: 'montoNetoAcreditado', label: 'MONTO NETO ACREDITADO' },
  NET_DEBIT_AMOUNT: { key: 'montoNetoDebitado', label: 'MONTO NETO DEBITADO' },
  GROSS_AMOUNT: { key: 'montoBrutoOperacion', label: 'MONTO BRUTO DE LA OPERACIÓN' },
  MP_FEE_AMOUNT: { key: 'comisionMercadoPago', label: 'COMISIÓN DE MERCADO PAGO O MERCADO LIBRE (INCLUYE IVA)' },
  FINANCING_FEE_AMOUNT: { key: 'comisionCuotasSinInteres', label: 'COMISIÓN POR OFRECER CUOTAS SIN INTERÉS' },
  SHIPPING_FEE_AMOUNT: { key: 'costoDeEnvio', label: 'COSTO DE ENVÍO' },
  TAXES_AMOUNT: { key: 'impuestosRetencionesIIBB', label: 'IMPUESTOS COBRADOS POR RETENCIONES IIBB' },
  COUPON_AMOUNT: { key: 'cuponDeDescuento', label: 'CUPÓN DE DESCUENTO' },
  INSTALLMENTS: { key: 'cuotas', label: 'CUOTAS' },
  PAYMENT_METHOD: { key: 'medioDePago', label: 'MEDIO DE PAGO' },
  TRANSACTION_APPROVAL_DATE: { key: 'fechaDeAprobacion', label: 'FECHA DE APROBACIÓN' },
  SHIPPING_ID: { key: 'idDelEnvio', label: 'ID DEL ENVÍO' },
  ORDER_ID: { key: 'idDeLaOrden', label: 'ID DE LA ORDEN' },
  POI_ID: { key: 'idDelPaquete', label: 'ID DEL PAQUETE' },
  REFUND_ID: { key: 'idDeReembolso', label: 'ID DE REEMBOLSO' },
  BALANCE_AMOUNT: { key: 'saldo', label: 'SALDO' },
};

function detectDelimiter(headerLine) {
  const semicolons = (headerLine.match(/;/g) || []).length;
  const commas = (headerLine.match(/,/g) || []).length;
  return semicolons >= commas ? ';' : ',';
}

function splitCsvLine(line, delimiter) {
  const fields = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === delimiter && !inQuotes) {
      fields.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  fields.push(current);
  return fields.map((field) => field.trim());
}

// Convierte el CSV del reporte de liberación en filas con claves legibles.
function parseReleaseReport(csv) {
  const lines = csv.split(/\r?\n/).filter((line) => line.trim() !== '');
  if (lines.length === 0) return { count: 0, headers: [], rows: [] };

  const delimiter = detectDelimiter(lines[0]);
  const headers = splitCsvLine(lines[0], delimiter);

  const rows = lines.slice(1).map((line) => {
    const values = splitCsvLine(line, delimiter);
    const row = {};
    headers.forEach((header, index) => {
      const mapping = COLUMN_MAP[header.toUpperCase()];
      const value = values[index] ?? '';
      row[mapping ? mapping.key : header] = value;
    });
    return row;
  });

  return { count: rows.length, headers, rows };
}

module.exports = { parseReleaseReport, COLUMN_MAP };
