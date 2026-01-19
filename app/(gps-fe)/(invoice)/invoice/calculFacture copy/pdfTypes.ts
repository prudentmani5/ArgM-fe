// types/pdfTypes.ts
export interface InvoicePDFProps {
    invoice?: any; // Rend la prop invoice optionnelle
}

export type PDFComponentType = React.ComponentType<InvoicePDFProps>;