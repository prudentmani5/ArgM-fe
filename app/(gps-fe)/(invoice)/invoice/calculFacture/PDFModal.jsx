'use client';

// components/PDFModal.jsx
import { Dialog } from 'primereact/dialog';
import { PDFViewer } from '@react-pdf/renderer';
import { Invoice } from './Invoice'; // Assurez-vous d'importer Invoice

export const PDFModal = ({ 
    visible, 
    onHide, 
    invoice, 
    pdfComponent 
}) => {
    // S'assurer que invoice n'est jamais null/undefined
    const safeInvoice = invoice || new Invoice();
    const PdfComponent = pdfComponent;
    
    return (
        <Dialog
            visible={visible}
            onHide={onHide}
            style={{ width: '90vw', height: '90vh' }}
            header="Aperçu de la Facture"
        >
            <PDFViewer style={{ width: '100%', height: '100%' }}>
                <PdfComponent invoice={safeInvoice} />
            </PDFViewer>
        </Dialog>
    );
};