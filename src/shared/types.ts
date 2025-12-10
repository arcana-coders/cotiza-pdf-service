export interface ProcessedItem {
    clave: string;
    descripcion: string;
    cantidad: number;
    precioUnitario: string; // Formatted currency
    importe: string; // Formatted currency
}

export interface ProcessedSeccion {
    titulo: string;
    items: ProcessedItem[];
}

export interface CotizacionData {
    cliente: string;
    fecha: string;
    folio?: string;
    secciones: ProcessedSeccion[];
    subtotal: string;
    iva: string;
    total: string;
    notas?: string[];
}
