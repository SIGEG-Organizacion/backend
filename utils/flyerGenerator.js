import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import { createCanvas, loadImage, registerFont } from "canvas";

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

export const generateFlyerPNG = async (
  opportunity,
  companyLogoUrl,
  outputPath
) => {
  // Opcional: puedes registrar una fuente personalizada si lo deseas
  // registerFont('path/to/font.ttf', { family: 'CustomFont' });

  const width = 800;
  const height = 1131; // Aproximadamente A4 a 72dpi
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");

  // Fondo blanco
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, width, height);

  // Fecha de creación
  ctx.font = "16px Courier";
  ctx.fillStyle = "#666";
  ctx.textAlign = "right";
  ctx.fillText(
    `Fecha de creación: ${new Date().toLocaleDateString()}`,
    width - 40,
    40
  );

  // Logo centrado
  if (companyLogoUrl) {
    try {
      const logo = await loadImage(companyLogoUrl);
      const logoSize = 100;
      ctx.drawImage(logo, (width - logoSize) / 2, 60, logoSize, logoSize);
    } catch (e) {
      // Si falla el logo, solo ignora
    }
  }

  let y = 180;
  ctx.textAlign = "center";
  ctx.font = "bold 32px Courier";
  ctx.fillStyle = "#000";
  ctx.fillText("¡Nueva Oportunidad!", width / 2, y);
  y += 50;

  // Sección: Descripción
  ctx.textAlign = "left";
  ctx.font = "bold 20px Courier";
  ctx.fillStyle = "#333";
  ctx.fillText("Descripción:", 40, y);
  y += 28;
  ctx.font = "16px Courier";
  ctx.fillStyle = "#000";
  ctx.fillText(opportunity.description, 40, y, width - 80);
  y += 40;

  // Sección: Requisitos
  ctx.font = "bold 20px Courier";
  ctx.fillStyle = "#333";
  ctx.fillText("Requisitos:", 40, y);
  y += 28;
  ctx.font = "16px Courier";
  ctx.fillStyle = "#000";
  if (Array.isArray(opportunity.requirements)) {
    opportunity.requirements.forEach((req) => {
      ctx.fillText(`• ${req}`, 60, y, width - 100);
      y += 24;
    });
  }
  y += 10;

  // Sección: Beneficios
  ctx.font = "bold 20px Courier";
  ctx.fillStyle = "#333";
  ctx.fillText("Beneficios:", 40, y);
  y += 28;
  ctx.font = "16px Courier";
  ctx.fillStyle = "#000";
  if (Array.isArray(opportunity.benefits)) {
    opportunity.benefits.forEach((benefit) => {
      ctx.fillText(`• ${benefit}`, 60, y, width - 100);
      y += 24;
    });
  }
  y += 10;

  // Sección: Detalles
  ctx.font = "bold 20px Courier";
  ctx.fillStyle = "#333";
  ctx.fillText("Detalles:", 40, y);
  y += 28;
  ctx.font = "16px Courier";
  ctx.fillStyle = "#000";
  ctx.fillText(`Modalidad: ${opportunity.mode}`, 60, y);
  y += 24;
  ctx.fillText(
    `Fecha límite: ${new Date(opportunity.deadline).toLocaleDateString()}`,
    60,
    y
  );
  y += 24;
  ctx.fillText(`Contacto: ${opportunity.email}`, 60, y);
  y += 24;
  ctx.fillText(
    `Para estudiantes: ${opportunity.forStudents ? "Sí" : "No"}`,
    60,
    y
  );

  // Guardar como PNG
  const out = fs.createWriteStream(outputPath);
  const stream = canvas.createPNGStream();
  stream.pipe(out);
  return new Promise((resolve, reject) => {
    out.on("finish", () => resolve(outputPath));
    out.on("error", reject);
  });
};
