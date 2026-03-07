import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface ColumnConfig {
    header: string;
    dataKey: string;
    formatter?: (value: any) => string;
}

interface ExportPDFOptions {
    title: string;
    columns: ColumnConfig[];
    data: any[];
    filename?: string;
    orientation?: 'portrait' | 'landscape';
    statistics?: { label: string; value: string | number }[];
}

export const exportToPDF = (options: ExportPDFOptions) => {
    const {
        title,
        columns,
        data,
        filename = 'rapport.pdf',
        orientation = 'landscape',
        statistics
    } = options;

    // Create new PDF document
    const doc = new jsPDF({
        orientation,
        unit: 'mm',
        format: 'a4'
    });

    // Add title
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(title, 14, 15);

    let currentY = 25;

    // Add statistics if provided
    if (statistics && statistics.length > 0) {
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');

        const statsPerRow = 4;
        const colWidth = (doc.internal.pageSize.width - 28) / statsPerRow;

        statistics.forEach((stat, index) => {
            const col = index % statsPerRow;
            const row = Math.floor(index / statsPerRow);
            const x = 14 + (col * colWidth);
            const y = currentY + (row * 10);

            doc.setFont('helvetica', 'bold');
            doc.text(`${stat.label}:`, x, y);
            doc.setFont('helvetica', 'normal');
            doc.text(String(stat.value), x, y + 5);
        });

        currentY += Math.ceil(statistics.length / statsPerRow) * 10 + 5;
    }

    // Prepare table data
    const tableColumns = columns.map(col => col.header);
    const tableRows = data.map(row =>
        columns.map(col => {
            const value = row[col.dataKey];
            return col.formatter ? col.formatter(value) : (value || '-');
        })
    );

    // Add table
    autoTable(doc, {
        head: [tableColumns],
        body: tableRows,
        startY: currentY,
        theme: 'grid',
        styles: {
            fontSize: 8,
            cellPadding: 2,
            overflow: 'linebreak',
            font: 'helvetica'
        },
        headStyles: {
            fillColor: [66, 139, 202],
            textColor: 255,
            fontStyle: 'bold',
            halign: 'center'
        },
        alternateRowStyles: {
            fillColor: [245, 245, 245]
        },
        margin: { top: 10, right: 14, bottom: 10, left: 14 }
    });

    // Add footer with date
    const pageCount = (doc as any).internal.getNumberOfPages();
    const pageHeight = doc.internal.pageSize.height;

    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        const exportDate = new Date().toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        doc.text(
            `Généré le ${exportDate} - Page ${i} sur ${pageCount}`,
            14,
            pageHeight - 10
        );
    }

    // Save the PDF
    doc.save(filename);
};

// Currency formatter for BIF
export const formatCurrency = (value: number): string => {
    if (!value && value !== 0) return '-';
    return new Intl.NumberFormat('fr-FR', {
        style: 'decimal',
        minimumFractionDigits: 0
    }).format(value) + ' BIF';
};

// Date formatter
export const formatDate = (dateString: string): string => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('fr-FR');
};
