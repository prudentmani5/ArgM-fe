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

// ─── Print-window report (matches epargne design) ────────────────────────────

interface PrintColumnConfig {
    header: string;
    dataKey: string;
    formatter?: (value: any, row?: any) => string;
    align?: 'left' | 'center' | 'right';
}

interface PrintReportOptions {
    title: string;
    dateRange?: string;
    columns: PrintColumnConfig[];
    data: any[];
    statistics?: { label: string; value: string | number }[];
}

export const printReport = (options: PrintReportOptions) => {
    const { title, dateRange, columns, data, statistics } = options;

    const dateRangeText = dateRange || `Au ${new Date().toLocaleDateString('fr-FR')}`;

    const statsHTML = statistics && statistics.length > 0
        ? `<div class="stats">${statistics.map(s => `<div class="stat-box"><strong>${s.label}:</strong><br/>${s.value}</div>`).join('')}</div>`
        : '';

    const theadCells = columns.map(c => `<th>${c.header}</th>`).join('');

    const tbodyRows = data.map(row => {
        const cells = columns.map(c => {
            const raw = row[c.dataKey];
            const val = c.formatter ? c.formatter(raw, row) : (raw !== null && raw !== undefined ? String(raw) : '-');
            const align = c.align ? `style="text-align:${c.align}"` : '';
            return `<td ${align}>${val || '-'}</td>`;
        }).join('');
        return `<tr>${cells}</tr>`;
    }).join('');

    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8"/>
  <title>${title}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Arial, sans-serif; margin: 20px; color: #1e293b; }
    .header { display:flex; justify-content:space-between; align-items:center;
               border-bottom:2px solid #4a90a4; padding-bottom:10px; margin-bottom:18px; }
    .logo-section { display:flex; align-items:center; gap:10px; }
    .company-name { font-size:16px; font-weight:bold; color:#1e3a5f; }
    .company-info { font-size:10px; color:#64748b; margin-top:2px; }
    .doc-title { font-size:15px; font-weight:bold; color:#1e3a5f; text-align:right; }
    .doc-date  { font-size:9px; color:#64748b; text-align:right; margin-top:4px; }
    .stats { display:flex; justify-content:space-around; flex-wrap:wrap; gap:8px;
             margin-bottom:18px; padding:12px 16px; background:#f1f5f9;
             border-radius:8px; border:1px solid #e2e8f0; }
    .stat-box { text-align:center; font-size:12px; }
    .stat-box strong { display:block; font-size:11px; color:#475569; margin-bottom:2px; }
    table { width:100%; border-collapse:collapse; font-size:10px; margin-top:4px; }
    th { background:#4a90a4; color:#fff; padding:7px 6px; text-align:left;
         font-size:10px; font-weight:bold; }
    td { border:1px solid #e2e8f0; padding:6px; vertical-align:top; }
    tr:nth-child(even) td { background:#f8fafc; }
    tr:hover td { background:#e0f2fe; }
    .footer { margin-top:24px; text-align:center; font-size:10px; color:#94a3b8;
               border-top:1px solid #e2e8f0; padding-top:8px; }
    @media print {
      body { margin: 10px; }
      .footer { position: fixed; bottom: 0; width: 100%; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo-section">
      <img src="/layout/images/logo/logoAgrinova.PNG" alt="Logo"
           style="height:60px;width:60px;object-fit:contain" onerror="this.style.display='none'"/>
      <div>
        <div class="company-name">AgrM MICROFINANCE</div>
        <div class="company-info">Bujumbura, Burundi</div>
      </div>
    </div>
    <div>
      <div class="doc-title">${title}</div>
      <div class="doc-date">${dateRangeText}</div>
    </div>
  </div>
  ${statsHTML}
  <table>
    <thead><tr>${theadCells}</tr></thead>
    <tbody>${tbodyRows}</tbody>
  </table>
  <div class="footer">
    Généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}
    &nbsp;|&nbsp; Total : ${data.length} enregistrement(s)
  </div>
  <script>window.onload = function(){ window.print(); }<\/script>
</body>
</html>`;

    const win = window.open('', '_blank');
    if (win) {
        win.document.write(html);
        win.document.close();
    }
};

// ─── Currency formatter for BIF ──────────────────────────────────────────────
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
