// utils/reportExportClient.js
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

/**
 * Exporta Reporte de Intereses a PDF en el cliente
 * @param {Object} report - Objeto report con type, data y generationDate
 * @param {string} logoUrl - URL pública del logo (LogoTEC.png)
 */
export async function exportInterestReportPDF(report, logoUrl) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const img = new Image();
  img.src = logoUrl;
  await new Promise((resolve) => {
    img.onload = resolve;
  });
  doc.addImage(img, "PNG", 40, 30, 100, 30);
  doc.setFontSize(18).text("Reporte de Intereses", 160, 50);
  doc
    .setFontSize(10)
    .text(
      `Generado: ${new Date(report.generationDate).toLocaleString()}`,
      40,
      80
    );
  // Filtros
  doc.setFontSize(12).text("Filtros aplicados:", 40, 110);
  const filters = Object.entries(report.data.filters).map(
    ([k, v]) => `${k}: ${v ?? "—"}`
  );
  filters.forEach((line, i) => doc.text(line, 60, 130 + i * 14));
  // Estadísticas
  const startY = 130 + filters.length * 14 + 20;
  doc.setFontSize(12).text("Estadísticas:", 40, startY);
  const stats = [
    `Total oportunidades: ${report.data.totalOpportunities}`,
    `Total intereses: ${report.data.totalInterests}`,
    `Promedio por oportunidad: ${report.data.avgInterestsPerOpportunity.toFixed(
      2
    )}`,
  ];
  stats.forEach((line, i) => doc.text(line, 60, startY + 20 + i * 14));
  if (report.data.description) {
    doc.text(`Descripción: ${report.data.description}`, 40, startY + 80);
  }
  const pdfBlob = doc.output("blob");
  saveAs(pdfBlob, `interest_report_${Date.now()}.pdf`);
}

/**
 * Exporta Reporte de Intereses a Excel en el cliente
 * @param {Object} report
 */
export function exportInterestReportExcel(report) {
  const header = ["Oportunidad UUID"];
  const rows = report.data.opportunityUuids.map((uuid) => [uuid]);
  const ws = XLSX.utils.aoa_to_sheet([header, ...rows]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Intereses");
  const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  saveAs(
    new Blob([wbout], { type: "application/octet-stream" }),
    `interest_${Date.now()}.xlsx`
  );
}

/**
 * Exporta Recuento de Oportunidades a PDF en el cliente
 * @param {Object} report
 * @param {string} logoUrl
 */
export async function exportOpportunityNumbersPDF(report, logoUrl) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const img = new Image();
  img.src = logoUrl;
  await new Promise((resolve) => {
    img.onload = resolve;
  });
  doc.addImage(img, "PNG", 40, 30, 100, 30);
  doc.setFontSize(18).text("Reporte de Oportunidades", 160, 50);
  doc
    .setFontSize(10)
    .text(
      `Generado: ${new Date(report.generationDate).toLocaleString()}`,
      40,
      80
    );
  // Tabla
  const head = [["Fecha", "Cantidad"]];
  const body = report.data.dataPoints
    ? report.data.dataPoints.map((pt) => [pt.date, pt.count])
    : [["Total", report.data.total]];
  autoTable(doc, { startY: 110, head, body, styles: { fontSize: 10 } });
  const pdfBlob = doc.output("blob");
  saveAs(pdfBlob, `opportunities_numbers_${Date.now()}.pdf`);
}

/**
 * Exporta Recuento de Oportunidades a Excel en el cliente
 * @param {Object} report
 */
export function exportOpportunityNumbersExcel(report) {
  const data = report.data.dataPoints
    ? report.data.dataPoints.map((pt) => ({
        Fecha: pt.date,
        Cantidad: pt.count,
      }))
    : [{ Fecha: "Total", Cantidad: report.data.total }];
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Oportunidades");
  const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  saveAs(
    new Blob([wbout], { type: "application/octet-stream" }),
    `opportunities_numbers_${Date.now()}.xlsx`
  );
}

/**
 * Exporta Estadísticas de Oportunidades a PDF en el cliente
 * @param {Object} report
 * @param {string} logoUrl
 */
export async function exportOpportunityStatsPDF(report, logoUrl) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const img = new Image();
  img.src = logoUrl;
  await new Promise((resolve) => {
    img.onload = resolve;
  });
  doc.addImage(img, "PNG", 40, 30, 100, 30);
  doc.setFontSize(18).text("Reporte de Estados de Oportunidades", 120, 50);
  doc
    .setFontSize(10)
    .text(
      `Generado: ${new Date(report.generationDate).toLocaleString()}`,
      40,
      80
    );
  const head = [["Estado", "Cantidad"]];
  const body = report.data.statusDistribution.map((row) => [
    row.status,
    row.count,
  ]);
  autoTable(doc, { startY: 110, head, body, styles: { fontSize: 10 } });
  doc.text(`Total: ${report.data.total}`, 40, doc.lastAutoTable.finalY + 20);
  if (report.data.average) {
    doc.text(
      `Promedio${
        report.data.groupBy ? " por periodo" : ""
      }: ${report.data.average.toFixed(2)}`,
      150,
      doc.lastAutoTable.finalY + 20
    );
  }
  const pdfBlob = doc.output("blob");
  saveAs(pdfBlob, `opportunity_stats_${Date.now()}.pdf`);
}

/**
 * Exporta Estadísticas de Oportunidades a Excel en el cliente
 * @param {Object} report
 */
export function exportOpportunityStatsExcel(report) {
  const data = report.data.statusDistribution.map((row) => ({
    Estado: row.status,
    Cantidad: row.count,
  }));
  data.push({ Estado: "Total", Cantidad: report.data.total });
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Estados");
  const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  saveAs(
    new Blob([wbout], { type: "application/octet-stream" }),
    `opportunity_stats_${Date.now()}.xlsx`
  );
}

/**
 * Exporta Estadísticas de Usuarios a PDF en el cliente
 * @param {Object} report
 * @param {string} logoUrl
 */
export async function exportUserStatsPDF(report, logoUrl) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const img = new Image();
  img.src = logoUrl;
  await new Promise((resolve) => {
    img.onload = resolve;
  });
  doc.addImage(img, "PNG", 40, 30, 100, 30);
  doc.setFontSize(18).text("Reporte de Usuarios", 160, 50);
  doc
    .setFontSize(10)
    .text(
      `Generado: ${new Date(report.generationDate).toLocaleString()}`,
      40,
      80
    );
  const head = [["Rol", "Validados", "Total"]];
  const val =
    report.data.filters.validated != null
      ? report.data.filters.validated
      : "Todos";
  const body = [
    [report.data.filters.role || "Todos", val, report.data.totalUsers],
  ];
  autoTable(doc, { startY: 110, head, body, styles: { fontSize: 10 } });
  const pdfBlob = doc.output("blob");
  saveAs(pdfBlob, `users_stats_${Date.now()}.pdf`);
}

/**
 * Exporta Estadísticas de Usuarios a Excel en el cliente
 * @param {Object} report
 */
export function exportUserStatsExcel(report) {
  const data = [
    {
      Rol: report.data.filters.role || "Todos",
      Validados:
        report.data.filters.validated != null
          ? report.data.filters.validated
          : "Todos",
      Total: report.data.totalUsers,
    },
  ];
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Usuarios");
  const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  saveAs(
    new Blob([wbout], { type: "application/octet-stream" }),
    `users_stats_${Date.now()}.xlsx`
  );
}
