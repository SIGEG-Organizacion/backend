import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";

export const generateFlyerPDF = (opportunity, companyLogoUrl, outputPath) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument();

    const writeStream = fs.createWriteStream(outputPath);
    doc.pipe(writeStream);

    doc.fontSize(20).text("Flyer de Oportunidad TEC", { align: "center" });

    doc.moveDown();

    doc.fontSize(14).text(`Descripción: ${opportunity.description}`);
    doc.text(`Requisitos:`);
    opportunity.requirements.forEach((req, i) => {
      doc.text(`${i + 1}. ${req}`);
    });

    doc.text(`Beneficios:`);
    opportunity.benefits.forEach((ben, i) => {
      doc.text(`${i + 1}. ${ben}`);
    });

    doc.text(`Modalidad: ${opportunity.mode}`);
    doc.text(`Fecha límite: ${opportunity.deadline.toDateString()}`);
    doc.text(`Contacto: ${opportunity.contact}`);

    // Agregar el logo al flyer
    doc.image(logoUrl, 50, 50, { width: 100, height: 100 }); // Ajusta la posición y tamaño

    doc.fontSize(12).text(`Description: ${opportunity.description}`, 50, 200);
    doc.text(`Requirements: ${opportunity.requirements.join(", ")}`, 50, 220);
    doc.text(`Benefits: ${opportunity.benefits.join(", ")}`, 50, 240);
    doc.text(`Deadline: ${opportunity.deadline}`, 50, 260);

    doc.end();

    writeStream.on("finish", () => {
      resolve(outputPath);
    });
    writeStream.on("error", (err) => {
      reject(err);
    });
  });
};
