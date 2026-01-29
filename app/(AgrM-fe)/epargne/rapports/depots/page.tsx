'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { Calendar } from 'primereact/calendar';
import { Dropdown } from 'primereact/dropdown';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Toast } from 'primereact/toast';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Tag } from 'primereact/tag';
import { Divider } from 'primereact/divider';
import useConsumApi from '../../../../../hooks/fetchData/useConsumApi';
import { API_BASE_URL } from '../../../../../utils/apiConfig';

const BRANCHES_URL = `${API_BASE_URL}/api/reference-data/branches`;
const REPORTS_URL = `${API_BASE_URL}/api/epargne/reports`;

interface DepositReport {
    id: number;
    slipNumber: string;
    depositDate: string;
    clientName: string;
    clientNumber: string;
    accountNumber: string;
    branchName: string;
    totalAmount: number;
    status: string;
    processedBy: string;
    sourceOfFunds?: string;
}

const RapportDepotsPage = () => {
    const toast = useRef<Toast>(null);

    // Separate hook instances for each data type to avoid race conditions
    const branchesApi = useConsumApi('');
    const reportApi = useConsumApi('');

    const [dateFrom, setDateFrom] = useState<Date | null>(null);
    const [dateTo, setDateTo] = useState<Date | null>(null);
    const [branchId, setBranchId] = useState<number | null>(null);
    const [status, setStatus] = useState<string | null>(null);
    const [branches, setBranches] = useState<any[]>([]);

    const statusOptions = [
        { label: 'En Attente', value: 'PENDING' },
        { label: 'Validé', value: 'COMPLETED' },
        { label: 'Annulé', value: 'CANCELLED' },
        { label: 'Rejeté', value: 'REJECTED' }
    ];
    const [reportData, setReportData] = useState<DepositReport[]>([]);
    const [loading, setLoading] = useState(false);
    const [totals, setTotals] = useState({
        totalDeposits: 0,
        totalAmount: 0,
        averageAmount: 0
    });

    useEffect(() => {
        loadReferenceData();
    }, []);

    // Handle branches data
    useEffect(() => {
        if (branchesApi.data) {
            const data = branchesApi.data;
            setBranches(Array.isArray(data) ? data : []);
        }
        if (branchesApi.error) {
            toast.current?.show({ severity: 'error', summary: 'Erreur', detail: branchesApi.error.message || 'Erreur lors du chargement des agences' });
        }
    }, [branchesApi.data, branchesApi.error]);

    // Handle report data
    useEffect(() => {
        if (reportApi.data) {
            const response = reportApi.data;
            // Handle both array response and wrapped response
            const dataArray = Array.isArray(response) ? response : (response.data || response.content || []);
            setReportData(dataArray);

            // Calculate totals from data if not provided by backend
            // Use totalAmount if available, otherwise fall back to amount
            const calculatedTotalAmount = dataArray.reduce((sum: number, item: any) => {
                const itemAmount = item.totalAmount || item.amount || 0;
                return sum + (typeof itemAmount === 'number' ? itemAmount : parseFloat(itemAmount) || 0);
            }, 0);
            const count = dataArray.length;

            setTotals({
                totalDeposits: response.totalDeposits || count,
                totalAmount: response.totalAmount || calculatedTotalAmount,
                averageAmount: response.averageAmount || (count > 0 ? calculatedTotalAmount / count : 0)
            });
            toast.current?.show({ severity: 'success', summary: 'Succès', detail: 'Rapport généré avec succès' });
            setLoading(false);
        }
        if (reportApi.error) {
            toast.current?.show({ severity: 'error', summary: 'Erreur', detail: 'Erreur lors de la génération du rapport' });
            setLoading(false);
        }
    }, [reportApi.data, reportApi.error]);

    const loadReferenceData = () => {
        branchesApi.fetchData(null, 'GET', `${BRANCHES_URL}/findall`, 'loadBranches');
    };

    const generateReport = () => {
        setLoading(true);
        const params = new URLSearchParams();
        if (dateFrom) params.append('dateFrom', dateFrom.toISOString().split('T')[0]);
        if (dateTo) params.append('dateTo', dateTo.toISOString().split('T')[0]);
        if (branchId) params.append('branchId', branchId.toString());
        if (status) params.append('status', status);

        reportApi.fetchData(null, 'GET', `${REPORTS_URL}/deposits?${params.toString()}`, 'generateReport');
    };

    const exportToPdf = () => {
        if (reportData.length === 0) {
            toast.current?.show({ severity: 'warn', summary: 'Attention', detail: 'Aucune donnée à exporter' });
            return;
        }

        const reportTitle = 'Rapport des Dépôts';
        const dateRange = dateFrom && dateTo
            ? `Du ${dateFrom.toLocaleDateString('fr-FR')} au ${dateTo.toLocaleDateString('fr-FR')}`
            : 'Toutes les dates';

        const tableHeaders = `
            <th>N° Bordereau</th>
            <th>Date</th>
            <th>Client</th>
            <th>N° Client</th>
            <th>N° Compte</th>
            <th>Agence</th>
            <th>Montant</th>
            <th>Statut</th>
            <th>Traité par</th>
        `;

        const tableRows = reportData.map(row => `
            <tr>
                <td>${row.slipNumber || '-'}</td>
                <td>${row.depositDate || '-'}</td>
                <td>${row.clientName || '-'}</td>
                <td>${row.clientNumber || '-'}</td>
                <td>${row.accountNumber || '-'}</td>
                <td>${row.branchName || '-'}</td>
                <td style="text-align: right;">${formatCurrency(row.totalAmount || row.amount || 0)}</td>
                <td>${row.status || '-'}</td>
                <td>${row.processedBy || '-'}</td>
            </tr>
        `).join('');

        const statsSection = `
            <div class="stats">
                <div class="stat-box"><strong>Nombre de Dépôts:</strong> ${totals.totalDeposits}</div>
                <div class="stat-box"><strong>Montant Total:</strong> ${formatCurrency(totals.totalAmount)}</div>
                <div class="stat-box"><strong>Moyenne par Dépôt:</strong> ${formatCurrency(totals.averageAmount)}</div>
            </div>
        `;

        const printContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>${reportTitle}</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    h1 { color: #333; text-align: center; }
                    .date-range { text-align: center; color: #666; margin-bottom: 20px; }
                    .stats { display: flex; justify-content: space-around; margin-bottom: 20px; padding: 15px; background: #f5f5f5; border-radius: 8px; }
                    .stat-box { text-align: center; }
                    table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 11px; }
                    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                    th { background-color: #4a90a4; color: white; }
                    tr:nth-child(even) { background-color: #f9f9f9; }
                    .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #999; }
                    @media print { body { margin: 0; } }
                </style>
            </head>
            <body>
                <h1>${reportTitle}</h1>
                <p class="date-range">${dateRange}</p>
                ${statsSection}
                <table>
                    <thead><tr>${tableHeaders}</tr></thead>
                    <tbody>${tableRows}</tbody>
                </table>
                <p class="footer">Généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}</p>
            </body>
            </html>
        `;

        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write(printContent);
            printWindow.document.close();
            printWindow.focus();
            setTimeout(() => {
                printWindow.print();
            }, 250);
        }

        toast.current?.show({ severity: 'success', summary: 'Export PDF', detail: 'Le document est prêt pour impression/enregistrement en PDF' });
    };

    const exportToExcel = () => {
        if (reportData.length === 0) {
            toast.current?.show({ severity: 'warn', summary: 'Attention', detail: 'Aucune donnée à exporter' });
            return;
        }

        const headers = ['N° Bordereau', 'Date', 'Client', 'N° Client', 'N° Compte', 'Agence', 'Montant', 'Statut', 'Traité par', 'Source des fonds'];
        const rows = reportData.map(row => [
            row.slipNumber || '',
            row.depositDate || '',
            row.clientName || '',
            row.clientNumber || '',
            row.accountNumber || '',
            row.branchName || '',
            String(row.totalAmount || row.amount || 0),
            row.status || '',
            row.processedBy || '',
            row.sourceOfFunds || ''
        ]);

        // Create CSV content with BOM for Excel UTF-8 support
        let csvContent = '\uFEFF' + headers.join(';') + '\n';
        rows.forEach(row => {
            csvContent += row.map(cell => `"${cell}"`).join(';') + '\n';
        });

        // Add totals row
        csvContent += '\n';
        csvContent += `"Total Dépôts";"${totals.totalDeposits}";;;;"Montant Total";"${totals.totalAmount}";;;\n`;

        // Create and download the file
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `rapport_depots_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        toast.current?.show({ severity: 'success', summary: 'Export Excel', detail: 'Le fichier CSV a été téléchargé avec succès' });
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('fr-BI', { style: 'decimal' }).format(value) + ' FBU';
    };

    const amountTemplate = (rowData: any) => {
        // Use totalAmount if available, otherwise fall back to amount
        const displayAmount = rowData.totalAmount || rowData.amount || 0;
        return <span className="font-bold text-green-600">{formatCurrency(displayAmount)}</span>;
    };

    const statusTemplate = (rowData: DepositReport) => {
        const getSeverity = (status: string) => {
            switch (status?.toUpperCase()) {
                case 'VALIDÉ': case 'VALIDATED': return 'success';
                case 'EN ATTENTE': case 'PENDING': return 'warning';
                case 'ANNULÉ': case 'CANCELLED': return 'danger';
                default: return 'info';
            }
        };
        return <Tag value={rowData.status} severity={getSeverity(rowData.status)} />;
    };

    return (
        <div className="card">
            <Toast ref={toast} />

            <div className="flex align-items-center justify-content-between mb-4">
                <div className="flex align-items-center gap-2">
                    <i className="pi pi-arrow-down text-4xl text-primary"></i>
                    <div>
                        <h2 className="m-0">Rapport des Dépôts</h2>
                        <p className="m-0 text-500">Historique des opérations de dépôt</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button label="PDF" icon="pi pi-file-pdf" severity="danger" onClick={exportToPdf} disabled={reportData.length === 0} />
                    <Button label="Excel" icon="pi pi-file-excel" severity="success" onClick={exportToExcel} disabled={reportData.length === 0} />
                </div>
            </div>

            <Divider />

            {/* Filtres */}
            <Card className="mb-4">
                <h5 className="m-0 mb-3">
                    <i className="pi pi-filter mr-2"></i>
                    Critères de Recherche
                </h5>
                <div className="formgrid grid">
                    <div className="field col-12 md:col-3">
                        <label htmlFor="dateFrom">Date Début</label>
                        <Calendar
                            id="dateFrom"
                            value={dateFrom}
                            onChange={(e) => setDateFrom(e.value as Date)}
                            dateFormat="dd/mm/yy"
                            showIcon
                            className="w-full"
                        />
                    </div>
                    <div className="field col-12 md:col-3">
                        <label htmlFor="dateTo">Date Fin</label>
                        <Calendar
                            id="dateTo"
                            value={dateTo}
                            onChange={(e) => setDateTo(e.value as Date)}
                            dateFormat="dd/mm/yy"
                            showIcon
                            className="w-full"
                        />
                    </div>
                    <div className="field col-12 md:col-3">
                        <label htmlFor="branch">Agence</label>
                        <Dropdown
                            id="branch"
                            value={branchId}
                            options={branches}
                            onChange={(e) => setBranchId(e.value)}
                            optionLabel="name"
                            optionValue="id"
                            placeholder="Toutes les agences"
                            showClear
                            className="w-full"
                        />
                    </div>
                    <div className="field col-12 md:col-3">
                        <label htmlFor="status">Statut</label>
                        <Dropdown
                            id="status"
                            value={status}
                            options={statusOptions}
                            onChange={(e) => setStatus(e.value)}
                            placeholder="Tous les statuts"
                            showClear
                            className="w-full"
                        />
                    </div>
                </div>
                <div className="flex justify-content-end mt-3">
                    <Button
                        label="Générer le Rapport"
                        icon="pi pi-search"
                        onClick={generateReport}
                        loading={loading}
                    />
                </div>
            </Card>

            {/* Statistiques */}
            {reportData.length > 0 && (
                <div className="grid mb-4">
                    <div className="col-12 md:col-4">
                        <Card className="bg-blue-50">
                            <div className="flex align-items-center gap-3">
                                <i className="pi pi-hashtag text-4xl text-blue-500"></i>
                                <div>
                                    <p className="text-500 m-0">Nombre de Dépôts</p>
                                    <p className="text-2xl font-bold m-0">{totals.totalDeposits}</p>
                                </div>
                            </div>
                        </Card>
                    </div>
                    <div className="col-12 md:col-4">
                        <Card className="bg-green-50">
                            <div className="flex align-items-center gap-3">
                                <i className="pi pi-wallet text-4xl text-green-500"></i>
                                <div>
                                    <p className="text-500 m-0">Montant Total</p>
                                    <p className="text-2xl font-bold m-0">{formatCurrency(totals.totalAmount)}</p>
                                </div>
                            </div>
                        </Card>
                    </div>
                    <div className="col-12 md:col-4">
                        <Card className="bg-purple-50">
                            <div className="flex align-items-center gap-3">
                                <i className="pi pi-chart-line text-4xl text-purple-500"></i>
                                <div>
                                    <p className="text-500 m-0">Moyenne par Dépôt</p>
                                    <p className="text-2xl font-bold m-0">{formatCurrency(totals.averageAmount)}</p>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            )}

            {/* Tableau des résultats */}
            {loading ? (
                <div className="flex justify-content-center p-5">
                    <ProgressSpinner />
                </div>
            ) : (
                <DataTable
                    value={reportData}
                    paginator
                    rows={10}
                    rowsPerPageOptions={[10, 25, 50]}
                    emptyMessage="Aucune donnée. Veuillez générer un rapport."
                    className="p-datatable-sm"
                    stripedRows
                >
                    <Column field="slipNumber" header="N° Bordereau" sortable />
                    <Column field="depositDate" header="Date" sortable />
                    <Column field="clientName" header="Client" sortable />
                    <Column field="clientNumber" header="N° Client" sortable />
                    <Column field="accountNumber" header="N° Compte" sortable />
                    <Column field="branchName" header="Agence" sortable />
                    <Column field="totalAmount" header="Montant" body={amountTemplate} sortable />
                    <Column field="status" header="Statut" body={statusTemplate} sortable />
                    <Column field="processedBy" header="Traité par" sortable />
                    <Column field="sourceOfFunds" header="Source des fonds" sortable />
                </DataTable>
            )}
        </div>
    );
};

export default RapportDepotsPage;
