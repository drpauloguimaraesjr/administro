// backend/src/services/prescription-pdf.service.ts

import { PDFDocument, StandardFonts, rgb, PDFPage, PDFFont, degrees } from 'pdf-lib';
import { db } from '../config/firebaseAdmin.js';
import { getStorage } from 'firebase-admin/storage';

const getDb = () => {
    if (!db) throw new Error('Firebase not configured');
    return db;
};

interface PrescriptionSettings {
    headerImageUrl?: string | null;
    footerImageUrl?: string | null;
    watermark?: {
        enabled: boolean;
        type: 'image' | 'text';
        imageUrl?: string | null;
        text?: string;
        opacity: number;
        scale?: number;
        applyTo: 'simples' | 'controlada' | 'ambas';
    };
    margins?: {
        headerSpacing: number;
        footerSpacing: number;
    };
    footerInfo?: {
        address?: string;
        phone?: string;
        showWhatsAppIcon?: boolean;
        instagramDoctor?: string;
        instagramClinic?: string;
    };
}

interface PrescriptionData {
    id: string;
    title: string;
    content: string;
    type: 'simples' | 'controlada';
    createdAt: string;
}

interface PatientData {
    name: string;
    cpf?: string;
    birthDate?: string;
    phone?: string;
    address?: string;
}

// Parse HTML content into plain text lines
function htmlToLines(html: string): string[] {
    let text = html
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<\/p>/gi, '\n')
        .replace(/<\/div>/gi, '\n')
        .replace(/<\/li>/gi, '\n')
        .replace(/<li>/gi, '• ')
        .replace(/<\/h[1-6]>/gi, '\n')
        .replace(/<h[1-6][^>]*>/gi, '')
        .replace(/<[^>]*>/g, '')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&apos;/g, "'");

    return text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
}

// Wrap text to fit within a given width
function wrapText(text: string, font: PDFFont, fontSize: number, maxWidth: number): string[] {
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';

    for (const word of words) {
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        const width = font.widthOfTextAtSize(testLine, fontSize);

        if (width > maxWidth && currentLine) {
            lines.push(currentLine);
            currentLine = word;
        } else {
            currentLine = testLine;
        }
    }

    if (currentLine) lines.push(currentLine);
    return lines;
}

// Fetch image as Uint8Array from URL
async function fetchImage(url: string): Promise<{ bytes: Uint8Array; type: 'png' | 'jpeg' } | null> {
    try {
        const response = await fetch(url);
        if (!response.ok) return null;

        const buffer = await response.arrayBuffer();
        const bytes = new Uint8Array(buffer);
        const contentType = response.headers.get('content-type') || '';

        const type = contentType.includes('png') ? 'png' as const : 'jpeg' as const;
        return { bytes, type };
    } catch {
        return null;
    }
}

export async function generatePrescriptionPdf(
    patientId: string,
    prescriptionId: string,
    prescriptionType: 'simples' | 'controlada' = 'simples'
): Promise<Uint8Array> {
    // 1. Fetch prescription data
    const prescriptionDoc = await db
        .collection('medical_records')
        .doc(patientId)
        .collection('prescriptions')
        .doc(prescriptionId)
        .get();

    if (!prescriptionDoc.exists) {
        throw new Error('Prescrição não encontrada');
    }

    const prescription = { id: prescriptionDoc.id, ...prescriptionDoc.data() } as PrescriptionData;

    // 2. Fetch patient data
    const patientDoc = await getDb().collection('patients').doc(patientId).get();
    const patient = patientDoc.exists ? (patientDoc.data() as PatientData) : { name: 'Paciente' };

    // 3. Fetch prescription settings
    const settingsDoc = await getDb().collection('prescription-settings').doc('default').get();
    const settings = (settingsDoc.exists ? settingsDoc.data() : {}) as PrescriptionSettings;

    // 4. Create PDF
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595.28, 841.89]); // A4
    const { width, height } = page.getSize();

    const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const fontItalic = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

    const margin = 50;
    const contentWidth = width - margin * 2;
    let yPos = height - margin;

    // ─── HEADER IMAGE ───
    if (settings.headerImageUrl) {
        const imgData = await fetchImage(settings.headerImageUrl);
        if (imgData) {
            const image = imgData.type === 'png'
                ? await pdfDoc.embedPng(imgData.bytes)
                : await pdfDoc.embedJpg(imgData.bytes);

            const imgAspect = image.width / image.height;
            const imgWidth = contentWidth;
            const imgHeight = imgWidth / imgAspect;

            page.drawImage(image, {
                x: margin,
                y: height - margin - imgHeight,
                width: imgWidth,
                height: imgHeight,
            });
            yPos -= imgHeight + (settings.margins?.headerSpacing || 1) * 28.35; // cm to points
        }
    }

    // ─── WATERMARK ───
    if (settings.watermark?.enabled) {
        const shouldApply =
            settings.watermark.applyTo === 'ambas' ||
            settings.watermark.applyTo === prescriptionType;

        if (shouldApply) {
            if (settings.watermark.type === 'text' && settings.watermark.text) {
                const watermarkFont = fontRegular;
                const scale = settings.watermark.scale ?? 60;
                const wmFontSize = Math.max(24, scale * 0.9);
                const opacity = settings.watermark.opacity ?? 0.15;

                page.drawText(settings.watermark.text, {
                    x: width / 2 - watermarkFont.widthOfTextAtSize(settings.watermark.text, wmFontSize) / 2,
                    y: height / 2,
                    size: wmFontSize,
                    font: watermarkFont,
                    color: rgb(0.7, 0.7, 0.7),
                    opacity: opacity,
                    rotate: degrees(-45),
                });
            } else if (settings.watermark.type === 'image' && settings.watermark.imageUrl) {
                const wmData = await fetchImage(settings.watermark.imageUrl);
                if (wmData) {
                    const wmImage = wmData.type === 'png'
                        ? await pdfDoc.embedPng(wmData.bytes)
                        : await pdfDoc.embedJpg(wmData.bytes);

                    const scale = (settings.watermark.scale ?? 60) / 100;
                    const wmWidth = contentWidth * scale;
                    const wmHeight = (wmImage.height / wmImage.width) * wmWidth;

                    page.drawImage(wmImage, {
                        x: (width - wmWidth) / 2,
                        y: (height - wmHeight) / 2,
                        width: wmWidth,
                        height: wmHeight,
                        opacity: settings.watermark.opacity ?? 0.15,
                    });
                }
            }
        }
    }

    // ─── TITLE ───
    page.drawText('PRESCRIÇÃO', {
        x: width / 2 - fontBold.widthOfTextAtSize('PRESCRIÇÃO', 14) / 2,
        y: yPos,
        size: 14,
        font: fontBold,
        color: rgb(0, 0, 0),
    });
    yPos -= 10;

    // Underline
    page.drawLine({
        start: { x: margin, y: yPos },
        end: { x: width - margin, y: yPos },
        thickness: 1.5,
        color: rgb(0, 0, 0),
    });
    yPos -= 20;

    // ─── PATIENT INFO ───
    page.drawText(`Paciente: ${patient.name || 'N/A'}`, {
        x: margin,
        y: yPos,
        size: 11,
        font: fontBold,
        color: rgb(0, 0, 0),
    });
    yPos -= 16;

    const dateStr = new Date().toLocaleDateString('pt-BR');
    page.drawText(`Data: ${dateStr}`, {
        x: margin,
        y: yPos,
        size: 10,
        font: fontRegular,
        color: rgb(0.3, 0.3, 0.3),
    });
    yPos -= 25;

    // ─── PRESCRIPTION CONTENT ───
    const lines = htmlToLines(prescription.content);
    const fontSize = 11;
    const lineHeight = 16;

    for (const line of lines) {
        // Detect if it's a header/section (all caps or starts with special chars)
        const isHeader = /^[A-ZÀ-Ú\s─═]{5,}$/.test(line) || line.startsWith('USO ');
        const isBullet = line.startsWith('•');

        const font = isHeader ? fontBold : fontRegular;
        const size = isHeader ? 12 : fontSize;
        const indent = isBullet ? margin + 10 : margin;

        const wrappedLines = wrapText(line, font, size, contentWidth - (indent - margin));

        for (const wl of wrappedLines) {
            // Check if we need a new page
            if (yPos < 100) {
                const newPage = pdfDoc.addPage([595.28, 841.89]);
                yPos = height - margin;
                // Re-apply watermark on new page if needed
            }

            page.drawText(wl, {
                x: indent,
                y: yPos,
                size,
                font,
                color: rgb(0, 0, 0),
            });
            yPos -= lineHeight;
        }

        if (isHeader) yPos -= 4; // Extra spacing after headers
    }

    // ─── FOOTER INFO ───
    const footerInfoY = 80;
    if (settings.footerInfo) {
        const parts: string[] = [];
        if (settings.footerInfo.address) parts.push(`📍 ${settings.footerInfo.address}`);
        if (settings.footerInfo.phone) parts.push(`📞 ${settings.footerInfo.phone}`);
        if (settings.footerInfo.instagramDoctor) parts.push(`📷 ${settings.footerInfo.instagramDoctor}`);
        if (settings.footerInfo.instagramClinic) parts.push(`📷 ${settings.footerInfo.instagramClinic}`);

        if (parts.length > 0) {
            const footerText = parts.join('  |  ');
            const footerFontSize = 7;
            const footerWidth = fontRegular.widthOfTextAtSize(footerText, footerFontSize);

            page.drawText(footerText, {
                x: Math.max(margin, (width - footerWidth) / 2),
                y: footerInfoY,
                size: footerFontSize,
                font: fontRegular,
                color: rgb(0.5, 0.5, 0.5),
            });
        }
    }

    // ─── FOOTER IMAGE ───
    if (settings.footerImageUrl) {
        const imgData = await fetchImage(settings.footerImageUrl);
        if (imgData) {
            const image = imgData.type === 'png'
                ? await pdfDoc.embedPng(imgData.bytes)
                : await pdfDoc.embedJpg(imgData.bytes);

            const imgAspect = image.width / image.height;
            const imgWidth = contentWidth;
            const imgHeight = Math.min(imgWidth / imgAspect, 60);

            page.drawImage(image, {
                x: margin,
                y: 15,
                width: imgWidth,
                height: imgHeight,
            });
        }
    }

    // Save and return bytes
    const pdfBytes = await pdfDoc.save();
    return pdfBytes;
}

// Save PDF to Firebase Storage and return the URL
export async function savePdfToStorage(
    patientId: string,
    prescriptionId: string,
    pdfBytes: Uint8Array
): Promise<string> {
    const bucket = getStorage().bucket();
    const fileName = `prescriptions/${patientId}/${prescriptionId}-${Date.now()}.pdf`;
    const file = bucket.file(fileName);

    await file.save(Buffer.from(pdfBytes), {
        contentType: 'application/pdf',
        metadata: {
            cacheControl: 'public, max-age=31536000',
        },
    });

    // Make publicly accessible
    await file.makePublic();
    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;

    return publicUrl;
}
