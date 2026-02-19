// Text extraction from PDF and DOCX files (client-side)
import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';

// PDF.js worker — CDN üzerinden yükleniyor.
// Vite local .mjs dosyalarını ESM olarak transform ettiği için
// local worker çalışmıyor. CDN en güvenilir çözüm.
pdfjsLib.GlobalWorkerOptions.workerSrc =
    'https://unpkg.com/pdfjs-dist@5.4.624/build/pdf.worker.min.mjs';

/**
 * PDF dosyasından metin çıkarımı
 */
export async function extractFromPDF(file) {
    try {
        const arrayBuffer = await file.arrayBuffer();
        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
        const pdf = await loadingTask.promise;

        let fullText = '';

        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();

            // Filter out empty items and collect items with positions
            const items = textContent.items
                .filter(item => item.str && item.transform)
                .map(item => ({
                    str: item.str,
                    x: item.transform[4],
                    y: item.transform[5],
                }));

            // Sort by visual reading order: top→bottom (Y descending), left→right (X ascending)
            items.sort((a, b) => {
                const yDiff = b.y - a.y; // descending Y = top first
                if (Math.abs(yDiff) > 2) return yDiff;
                return a.x - b.x; // same line → left to right
            });

            // Group items into lines based on Y proximity
            const lines = [];
            let currentLine = [];
            let currentY = null;

            for (const item of items) {
                if (currentY !== null && Math.abs(item.y - currentY) > 2) {
                    // New line
                    if (currentLine.length > 0) {
                        lines.push({ y: currentY, items: currentLine });
                    }
                    currentLine = [item];
                    currentY = item.y;
                } else {
                    currentLine.push(item);
                    if (currentY === null) currentY = item.y;
                }
            }
            if (currentLine.length > 0) {
                lines.push({ y: currentY, items: currentLine });
            }

            // Build text from lines, detecting paragraph gaps
            let lastLineY = null;
            for (const line of lines) {
                // Sort items within line by X (left to right)
                line.items.sort((a, b) => a.x - b.x);
                const lineText = line.items.map(item => item.str).join(' ').replace(/\s+/g, ' ').trim();

                if (lineText) {
                    // Detect paragraph break (large vertical gap)
                    if (lastLineY !== null && Math.abs(lastLineY - line.y) > 18) {
                        fullText += '\n';
                    }
                    fullText += lineText + '\n';
                    lastLineY = line.y;
                }
            }
            fullText += '\n';
        }

        return {
            success: true,
            text: fullText.trim(),
            pages: pdf.numPages,
            fileName: file.name
        };
    } catch (error) {
        console.error('PDF extraction error:', error);
        return {
            success: false,
            text: '',
            error: `PDF okunamadı: ${error.message}`
        };
    }
}

/**
 * DOCX dosyasından metin çıkarımı
 */
export async function extractFromDOCX(file) {
    try {
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });

        return {
            success: true,
            text: result.value.trim(),
            fileName: file.name,
            warnings: result.messages
        };
    } catch (error) {
        console.error('DOCX extraction error:', error);
        return {
            success: false,
            text: '',
            error: `DOCX okunamadı: ${error.message}`
        };
    }
}

/**
 * Dosya tipine göre metin çıkarımı
 */
export async function extractText(file) {
    const fileName = file.name.toLowerCase();

    if (fileName.endsWith('.pdf')) {
        return extractFromPDF(file);
    } else if (fileName.endsWith('.docx') || fileName.endsWith('.doc')) {
        return extractFromDOCX(file);
    } else {
        // Düz metin dosyaları
        try {
            const text = await file.text();
            return {
                success: true,
                text: text.trim(),
                fileName: file.name
            };
        } catch (error) {
            return {
                success: false,
                text: '',
                error: `Dosya okunamadı: ${error.message}`
            };
        }
    }
}
