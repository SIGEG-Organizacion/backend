import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";

export const generateFlyerPDF = (opportunity, companyLogoUrl, outputPath) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument();

    const writeStream = fs.createWriteStream(outputPath);
    doc.pipe(writeStream);

    doc.fontSize(20).text("¡Nueva Oportunidad!", { align: "center" });

    doc.moveDown();

    doc.fontSize(16).font('Helvetica-Bold').text('Descripción:', { align: 'center' });
    doc.fontSize(14).font('Helvetica').text(opportunity.description, { align: 'center' });
    doc.moveDown();

    doc.fontSize(16).font('Helvetica-Bold').text('Requisitos:', { align: 'center' });
    opportunity.requirements.forEach(req => {
    doc.fontSize(14).font('Helvetica').text(`- ${req}`, { align: 'center' });
    });
    doc.moveDown();

    doc.fontSize(16).font('Helvetica-Bold').text('Beneficios:', { align: 'center' });
    opportunity.benefits.forEach(benefit => {
    doc.fontSize(14).font('Helvetica').text(`- ${benefit}`, { align: 'center' });
    });
    doc.moveDown();

    doc.fontSize(14).font('Helvetica').text(`Modalidad: ${opportunity.mode}`, { align: 'center' });
    doc.text(`Fecha límite: ${new Date(opportunity.deadline).toDateString()}`, { align: 'center' });
    doc.text(`Contacto: ${opportunity.contact}`, { align: 'center' });
    doc.moveDown();

    if (companyLogoUrl) {
      doc.image(companyLogoUrl, 50, 50, { width: 100, height: 100 }); // Ajusta la posición y tamaño
    }

    doc.end();

    writeStream.on("finish", () => {
      resolve(outputPath);
    });
    writeStream.on("error", (err) => {
      reject(err);
    });
  });
};
