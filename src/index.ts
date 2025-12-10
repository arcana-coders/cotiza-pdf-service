import express, { Request, Response } from 'express';
import cors from 'cors';
import { generatePDFBuffer } from './pdf/generator';
import { CotizacionSchema } from './shared/schemas';

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Middleware to check for authentication token
const authMiddleware = (req: Request, res: Response, next: express.NextFunction): void => {
    const token = req.headers['x-pdf-service-token'];
    const expectedToken = process.env.PDF_SERVICE_TOKEN;

    if (!expectedToken) {
        // If no token configured on server, warn but allow (or fail safe, dependent on policy)
        // For security, better to fail if not configured in production
        if (process.env.NODE_ENV === 'production') {
            res.status(500).json({ error: 'Server misconfiguration: missing auth token' });
            return;
        }
        next();
        return;
    }

    if (token !== expectedToken) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
    }

    next();
};

app.get('/health', (req: Request, res: Response) => {
    res.json({ status: 'ok', service: 'pdf-service' });
});

app.post('/generate-pdf', authMiddleware, async (req: Request, res: Response): Promise<void> => {
    try {
        const { quotationData } = req.body;

        if (!quotationData) {
            res.status(400).json({ error: 'Missing quotationData' });
            return;
        }

        // Validate input
        const parseResult = CotizacionSchema.safeParse(quotationData);
        if (!parseResult.success) {
            res.status(400).json({ error: 'Invalid data', details: parseResult.error.issues });
            return;
        }

        const pdfBuffer = await generatePDFBuffer(parseResult.data);

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${parseResult.data.folio || 'cotizacion'}_${parseResult.data.cliente.replace(/\s+/g, '_')}.pdf"`);

        res.send(Buffer.from(pdfBuffer));

    } catch (error) {
        console.error('Error generating PDF:', error);
        res.status(500).json({ error: 'Internal server error generating PDF' });
    }
});

app.listen(port, () => {
    console.log(`PDF Service running on port ${port}`);
});
