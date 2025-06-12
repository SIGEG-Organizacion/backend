import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";

export const generateFlyerPDF = (opportunity, companyLogoUrl, outputPath) => {
  return new Promise((resolve, reject) => {
    // Crear documento A4 con márgenes
    const doc = new PDFDocument({
      size: "A4",
      margins: { top: 60, bottom: 60, left: 50, right: 50 },
    });
    const writeStream = fs.createWriteStream(outputPath);
    doc.pipe(writeStream);

    // 1) Fecha de creación arriba a la derecha
    const createdAt = new Date().toLocaleDateString();
    doc
      .font("Courier")
      .fontSize(9)
      .fillColor("#666")
      .text(`Fecha de creación: ${createdAt}`, { align: "right" });
    doc.moveDown(1);

    // 2) Logo centrado en la parte superior en sección dedicada
    const logoSectionY = doc.y;
    if (companyLogoUrl) {
      const logoSize = 80;
      const x = (doc.page.width - logoSize) / 2;
      // Dibujar logo en posición fija
      doc.image(companyLogoUrl, x, logoSectionY, {
        width: logoSize,
        height: logoSize,
      });
      // Mover cursor justo debajo del logo
      doc.y = logoSectionY + logoSize + 20;
    } else {
      // Si no hay logo, dejar espacio equivalente
      doc.y += 100;
    }

    // 3) Título principal
    doc
      .font("Courier-Bold")
      .fontSize(24)
      .fillColor("#000")
      .text("¡Nueva Oportunidad!", { align: "center" });
    doc.moveDown(2);

    // 4) Secciones simples: título + texto
    const section = (title, contentFn) => {
      doc.font("Courier-Bold").fontSize(16).fillColor("#333").text(title);
      doc.moveDown(0.5);
      doc.font("Courier").fontSize(11).fillColor("#000");
      contentFn();
      doc.moveDown(1.5);
    };

    // Descripción
    section("Descripción:", () => {
      doc.text(opportunity.description, { align: "left" });
    });

    // Requisitos
    section("Requisitos:", () => {
      opportunity.requirements.forEach((req) => {
        doc.text(`• ${req}`);
      });
    });

    // Beneficios
    section("Beneficios:", () => {
      opportunity.benefits.forEach((benefit) => {
        doc.text(`• ${benefit}`);
      });
    });

    // Detalles
    section("Detalles:", () => {
      doc.text(`Modalidad: ${opportunity.mode}`);
      doc.text(
        `Fecha límite: ${new Date(opportunity.deadline).toLocaleDateString()}`
      );
      doc.text(`Contacto: ${opportunity.email}`);
      doc.text(`Para estudiantes: ${opportunity.forStudents ? "Sí" : "No"}`);
    });

    // Finalizar
    doc.end();
    writeStream.on("finish", () => resolve(outputPath));
    writeStream.on("error", (err) => reject(err));
  });
};
