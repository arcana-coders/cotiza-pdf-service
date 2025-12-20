import { z } from 'zod';

export const ItemSchema = z.object({
    clave: z.string().optional().default(''), // Make optional to prevent validation errors
    descripcion: z.string(),
    cantidad: z.number().positive(),
    precioUnitario: z.number().nonnegative(),
});

export const SeccionSchema = z.object({
    titulo: z.string(),
    items: z.array(ItemSchema),
});

export const CotizacionSchema = z.object({
    cliente: z.string(),
    fecha: z.string(), // YYYY-MM-DD
    folio: z.string().optional(),
    secciones: z.array(SeccionSchema),
    notas: z.array(z.string()).optional(),
});

export type CotizacionInput = z.infer<typeof CotizacionSchema>;
