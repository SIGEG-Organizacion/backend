// reportExporter.js

import { saveAs } from "file-saver";
import blobStream from "blob-stream";
import PDFDocument from "pdfkit/js/pdfkit.standalone.js";
import ExcelJS from "exceljs/dist/exceljs.min.js";

// Traducciones
const etiquetaCampo = {
  date: "Fecha",
  period: "Periodo",
  count: "Cantidad",
  status: "Estado",
  totalUsers: "Total Usuarios",
  opportunity: "Oportunidad",
};
const etiquetaFiltro = {
  companyName: "Empresa",
  startDate: "Fecha inicio",
  endDate: "Fecha fin",
  forStudents: "Para estudiantes",
  opportunityUuid: "UUID Oportunidad",
  status: "Estado",
  groupBy: "Granularidad",
};
const traduccionGroupBy = { day: "Diario", month: "Mensual" };

function formatearValor(val) {
  if (typeof val === "boolean") return val ? "Sí" : "No";
  if (typeof val === "string" && traduccionGroupBy[val])
    return traduccionGroupBy[val];
  return val != null ? String(val) : "";
}
function obtenerCabecera(titulo) {
  return { titulo, fecha: new Date().toLocaleDateString("es-CR") };
}

// Genera y descarga PDF en browser
export function exportReportPDFBrowser(reportData, filename = "reporte.pdf") {
  const doc = new PDFDocument({ margin: 40 });
  const stream = doc.pipe(blobStream());

  const cab = obtenerCabecera(reportData.type);
  doc.fontSize(18).text(cab.titulo.toUpperCase(), { align: "center" });
  doc.moveDown();
  doc.fontSize(10).text(`Fecha de generación: ${reportData.generationDate}`);
  doc.moveDown();

  // Filtros
  doc
    .fontSize(12)
    .fillColor("#444")
    .text("Filtros aplicados", { underline: true });
  Object.entries(reportData.filters || {}).forEach(([k, v]) => {
    doc.text(`${etiquetaFiltro[k] || k}: ${formatearValor(v)}`);
  });
  doc.moveDown();

  // Datos
  doc
    .fontSize(12)
    .fillColor("#000")
    .text("Datos del informe", { underline: true });
  const rows = Array.isArray(reportData.data)
    ? reportData.data
    : [reportData.data];
  if (rows.length) {
    const cols = Object.keys(rows[0]);
    const startY = doc.y + 10;
    const colWidth = (doc.page.width - 80) / cols.length;
    // Header
    cols.forEach((c, i) =>
      doc.text(etiquetaCampo[c] || c, 40 + i * colWidth, startY)
    );
    // Values
    rows.forEach((r, ri) => {
      cols.forEach((c, ci) => {
        doc.text(
          formatearValor(r[c]),
          40 + ci * colWidth,
          startY + 20 * (ri + 1)
        );
      });
    });
  }

  doc.end();
  stream.on("finish", () => {
    const blob = stream.toBlob("application/pdf");
    saveAs(blob, filename);
  });
}

// Genera y descarga Excel en browser
export async function exportReportExcelBrowser(
  reportData,
  filename = "reporte.xlsx"
) {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Reporte");

  // Cabecera
  sheet.mergeCells("A1", "D1");
  sheet.getCell("A1").value = reportData.type.toUpperCase();
  sheet.getCell(
    "A2"
  ).value = `Fecha de generación: ${reportData.generationDate}`;

  // Tabla filtros
  const filtRows = Object.entries(reportData.filters || {}).map(([k, v]) => [
    etiquetaFiltro[k] || k,
    formatearValor(v),
  ]);
  sheet.addTable({
    name: "Filtros",
    ref: "A4",
    headerRow: true,
    columns: [{ name: "Filtro" }, { name: "Valor" }],
    rows: filtRows.length ? filtRows : [["—", ""]],
  });

  // Tabla datos
  const rows = Array.isArray(reportData.data)
    ? reportData.data
    : [reportData.data];
  if (rows.length) {
    const cols = Object.keys(rows[0]).map((c) => ({
      name: etiquetaCampo[c] || c,
    }));
    const dataRows = rows.map((r) =>
      Object.values(r).map((v) => formatearValor(v))
    );
    const startRow = 6 + filtRows.length;
    sheet.addTable({
      name: "Datos",
      ref: `A${startRow}`,
      headerRow: true,
      columns: cols,
      rows: dataRows,
    });
  }

  const buf = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buf], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  saveAs(blob, filename);
}

// Atajos export
export function exportOpportunityNumbersPDFBrowser(data) {
  return exportReportPDFBrowser(
    Object.assign({ type: "NÚMEROS OPORTUNIDADES" }, data),
    "numeros-oportunidades.pdf"
  );
}
export function exportOpportunityStatsPDFBrowser(data) {
  return exportReportPDFBrowser(
    Object.assign({ type: "ESTADO OPORTUNIDADES" }, data),
    "estado-oportunidades.pdf"
  );
}
export function exportUserStatsPDFBrowser(data) {
  return exportReportPDFBrowser(
    Object.assign({ type: "ESTADÍSTICAS USUARIOS" }, data),
    "usuarios.pdf"
  );
}
export function exportInterestNumbersPDFBrowser(data) {
  return exportReportPDFBrowser(
    Object.assign({ type: "NÚMEROS DE INTERESES" }, data),
    "intereses.pdf"
  );
}

export function exportOpportunityNumbersExcelBrowser(data) {
  return exportReportExcelBrowser(
    Object.assign({ type: "NÚMEROS OPORTUNIDADES" }, data),
    "numeros-oportunidades.xlsx"
  );
}
export function exportOpportunityStatsExcelBrowser(data) {
  return exportReportExcelBrowser(
    Object.assign({ type: "ESTADO OPORTUNIDADES" }, data),
    "estado-oportunidades.xlsx"
  );
}
export function exportUserStatsExcelBrowser(data) {
  return exportReportExcelBrowser(
    Object.assign({ type: "ESTADÍSTICAS USUARIOS" }, data),
    "usuarios.xlsx"
  );
}
export function exportInterestNumbersExcelBrowser(data) {
  return exportReportExcelBrowser(
    Object.assign({ type: "NÚMEROS DE INTERESES" }, data),
    "intereses.xlsx"
  );
}
