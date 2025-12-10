import puppeteer from 'puppeteer';
import handlebars from 'handlebars';
import fs from 'fs/promises';
import path from 'path';
import currency from 'currency.js';
import { CotizacionInput } from '../shared/schemas';
import { CotizacionData, ProcessedSeccion, ProcessedItem } from '../shared/types';

const formatCurrency = (value: number) => currency(value, { symbol: '$', separator: ',', decimal: '.' }).format();

export async function generateHTML(input: CotizacionInput): Promise<string> {
    // 1. Calculate Totals
    let subtotalVal = 0;
    const processedSecciones: ProcessedSeccion[] = input.secciones.map(seccion => {
        const items: ProcessedItem[] = seccion.items.map(item => {
            const importeVal = item.cantidad * item.precioUnitario;
            subtotalVal += importeVal;
            return {
                ...item,
                precioUnitario: formatCurrency(item.precioUnitario),
                importe: formatCurrency(importeVal),
            };
        });
        return { ...seccion, items };
    });

    const ivaVal = subtotalVal * 0.16;
    const totalVal = subtotalVal + ivaVal;

    const defaultNotas = [
        '60% anticipo, 40% contra aviso de entrega.'
    ];

    const data: CotizacionData = {
        cliente: input.cliente,
        fecha: input.fecha,
        folio: input.folio,
        secciones: processedSecciones,
        subtotal: formatCurrency(subtotalVal),
        iva: formatCurrency(ivaVal),
        total: formatCurrency(totalVal),
        notas: (input.notas && input.notas.length > 0) ? input.notas : defaultNotas,
    };

    // 2. Compile Template
    // In production/dist, templates might be in a different relative path.
    // For now, assuming src/templates or dist/templates structure.
    const templatePath = path.join(process.cwd(), 'src/templates/quotation.hbs');
    let templateHtml;
    try {
        templateHtml = await fs.readFile(templatePath, 'utf-8');
    } catch (e) {
        // Fallback for dist structure if needed, or adjust path logic
        const distTemplatePath = path.join(__dirname, '../../src/templates/quotation.hbs');
        templateHtml = await fs.readFile(distTemplatePath, 'utf-8');
    }

    // Read logo and convert to base64
    const logoPath = path.join(process.cwd(), 'public/logo.png');
    let logoBase64 = '';
    try {
        const logoBuffer = await fs.readFile(logoPath);
        logoBase64 = `data:image/png;base64,${logoBuffer.toString('base64')}`;
    } catch (error) {
        console.warn('Logo not found or could not be read:', error);
    }

    const template = handlebars.compile(templateHtml);

    handlebars.registerHelper('json', function (context: unknown) {
        return JSON.stringify(context);
    });

    return template({ ...data, logo: logoBase64, rawData: input });
}

export async function generatePDFBuffer(input: CotizacionInput): Promise<Uint8Array> {
    const html = await generateHTML(input);

    const browser = await puppeteer.launch({
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        headless: true, // New headless mode is default in newer puppeteer versions
    });

    try {
        const page = await browser.newPage();

        // Set content and wait for fonts to load
        await page.setContent(html, { waitUntil: 'networkidle0' });

        const pdfBuffer = await page.pdf({
            format: 'letter',
            printBackground: true,
            margin: {
                top: '0.5in',
                bottom: '0.5in',
                left: '0.75in',
                right: '0.75in',
            },
        });

        return pdfBuffer;
    } finally {
        await browser.close();
    }
}
