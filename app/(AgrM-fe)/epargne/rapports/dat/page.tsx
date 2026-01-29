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

interface TermDepositReport {
    id: number;
    certificateNumber: string;
    clientName: string;
    clientNumber: string;
    branchName: string;
    principalAmount: number;
    interestRate: number;
    termDuration: string;
    startDate: string;
    maturityDate: string;
    projectedInterest: number;
    accruedInterest: number;
    status: string;
    maturityInstruction: string;
}

const RapportDATPage = () => {
    const toast = useRef<Toast>(null);

    // Separate hook instances for each data type to avoid race conditions
    const branchesApi = useConsumApi('');
    const reportApi = useConsumApi('');

    const [dateFrom, setDateFrom] = useState<Date | null>(null);
    const [dateTo, setDateTo] = useState<Date | null>(null);
    const [branchId, setBranchId] = useState<number | null>(null);
    const [status, setStatus] = useState<string | null>(null);
    const [branches, setBranches] = useState<any[]>([]);
    const [reportData, setReportData] = useState<TermDepositReport[]>([]);
    const [loading, setLoading] = useState(false);
    const [totals, setTotals] = useState({
        totalDeposits: 0,
        totalPrincipal: 0,
        totalProjectedInterest: 0,
        totalAccruedInterest: 0,
        averageRate: 0
    });

    const statusOptions = [
        { label: 'Actif', value: 'ACTIVE' },
        { label: 'Échu', value: 'MATURED' },
        { label: 'Renouvelé', value: 'RENEWED' },
        { label: 'Clôturé', value: 'CLOSED' },
        { label: 'Retrait Anticipé', value: 'EARLY_WITHDRAWAL' }
    ];

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
            setReportData(response.data || []);
            setTotals({
                totalDeposits: response.totalDeposits || 0,
                totalPrincipal: response.totalPrincipal || 0,
                totalProjectedInterest: response.totalProjectedInterest || 0,
                totalAccruedInterest: response.totalAccruedInterest || 0,
                averageRate: response.averageRate || 0
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

        reportApi.fetchData(null, 'GET', `${REPORTS_URL}/term-deposits?${params.toString()}`, 'generateReport');
    };

    const exportToPdf = () => {
        if (reportData.length === 0) {
            toast.current?.show({ severity: 'warn', summary: 'Attention', detail: 'Aucune donnée à exporter' });
            return;
        }

        const reportTitle = 'Rapport des Dépôts à Terme (DAT)';
        const dateRange = dateFrom && dateTo
            ? `Échéance du ${dateFrom.toLocaleDateString('fr-FR')} au ${dateTo.toLocaleDateString('fr-FR')}`
            : 'Toutes les échéances';

        const statusLabels: { [key: string]: string } = {
            'ACTIVE': 'Actif',
            'MATURED': 'Échu',
            'RENEWED': 'Renouvelé',
            'CLOSED': 'Clôturé',
            'EARLY_WITHDRAWAL': 'Retrait Anticipé'
        };

        const tableHeaders = `
            <th>N° Certificat</th>
            <th>Client</th>
            <th>N° Client</th>
            <th>Agence</th>
            <th>Capital</th>
            <th>Taux</th>
            <th>Durée</th>
            <th>Date Début</th>
            <th>Échéance</th>
            <th>Intérêts Projetés</th>
            <th>Statut</th>
        `;

        const tableRows = reportData.map(row => `
            <tr>
                <td>${row.certificateNumber || '-'}</td>
                <td>${row.clientName || '-'}</td>
                <td>${row.clientNumber || '-'}</td>
                <td>${row.branchName || '-'}</td>
                <td style="text-align: right;">${formatCurrency(row.principalAmount || 0)}</td>
                <td>${row.interestRate || 0}%</td>
                <td>${row.termDuration || '-'}</td>
                <td>${row.startDate || '-'}</td>
                <td>${row.maturityDate || '-'}</td>
                <td style="text-align: right;">${formatCurrency(row.projectedInterest || 0)}</td>
                <td>${statusLabels[row.status] || row.status || '-'}</td>
            </tr>
        `).join('');

        const statsSection = `
            <div class="stats">
                <div class="stat-box"><strong>Nombre de DAT:</strong> ${totals.totalDeposits}</div>
                <div class="stat-box"><strong>Capital Total:</strong> ${formatCurrency(totals.totalPrincipal)}</div>
                <div class="stat-box"><strong>Intérêts Projetés:</strong> ${formatCurrency(totals.totalProjectedInterest)}</div>
                <div class="stat-box"><strong>Taux Moyen:</strong> ${totals.averageRate.toFixed(2)}%</div>
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
                    table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 10px; }
                    th, td { border: 1px solid #ddd; padding: 6px; text-align: left; }
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

        const headers = ['N° Certificat', 'Client', 'N° Client', 'Agence', 'Capital', 'Taux (%)', 'Durée', 'Date Début', 'Échéance', 'Intérêts Projetés', 'Intérêts Courus', 'Statut', 'Instruction à l\'échéance'];
        const rows = reportData.map(row => [
            row.certificateNumber || '',
            row.clientName || '',
            row.clientNumber || '',
            row.branchName || '',
            String(row.principalAmount || 0),
            String(row.interestRate || 0),
            row.termDuration || '',
            row.startDate || '',
            row.maturityDate || '',
            String(row.projectedInterest || 0),
            String(row.accruedInterest || 0),
            row.status || '',
            row.maturityInstruction || ''
        ]);

        // Create CSV content with BOM for Excel UTF-8 support
        let csvContent = '\uFEFF' + headers.join(';') + '\n';
        rows.forEach(row => {
            csvContent += row.map(cell => `"${cell}"`).join(';') + '\n';
        });

        // Add totals row
        csvContent += '\n';
        csvContent += `"Total DAT";"${totals.totalDeposits}";;;"Capital Total";"${totals.totalPrincipal}";;"Intérêts Projetés";"${totals.totalProjectedInterest}";;"Taux Moyen";"${totals.averageRate.toFixed(2)}%"\n`;

        // Create and download the file
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `rapport_dat_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        toast.current?.show({ severity: 'success', summary: 'Export Excel', detail: 'Le fichier CSV a été téléchargé avec succès' });
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('fr-BI', { style: 'decimal' }).format(value) + ' FBU';
    };

    const principalTemplate = (rowData: TermDepositReport) => {
        return <span className="font-bold text-blue-600">{formatCurrency(rowData.principalAmount)}</span>;
    };

    const interestTemplate = (rowData: TermDepositReport) => {
        return <span className="font-bold text-green-600">{formatCurrency(rowData.projectedInterest)}</span>;
    };

    const rateTemplate = (rowData: TermDepositReport) => {
        return <Tag value={`${rowData.interestRate}%`} severity="info" />;
    };

    const statusTemplate = (rowData: TermDepositReport) => {
        const getSeverity = (status: string) => {
            switch (status?.toUpperCase()) {
                case 'ACTIVE': return 'success';
                case 'MATURED': return 'warning';
                case 'RENEWED': return 'info';
                case 'CLOSED': return 'secondary';
                case 'EARLY_WITHDRAWAL': return 'danger';
                default: return 'info';
            }
        };
        const labels: { [key: string]: string } = {
            'ACTIVE': 'Actif',
            'MATURED': 'Échu',
            'RENEWED': 'Renouvelé',
            'CLOSED': 'Clôturé',
            'EARLY_WITHDRAWAL': 'Retrait Anticipé'
        };
        return <Tag value={labels[rowData.status] || rowData.status} severity={getSeverity(rowData.status)} />;
    };

    return (
        <div className="card">
            <Toast ref={toast} />

            <div className="flex align-items-center justify-content-between mb-4">
                <div className="flex align-items-center gap-2">
                    <i className="pi pi-lock text-4xl text-primary"></i>
                    <div>
                        <h2 className="m-0">Rapport des Dépôts à Terme (DAT)</h2>
                        <p className="m-0 text-500">État des placements à terme et intérêts</p>
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
                        <label htmlFor="dateFrom">Échéance Du</label>
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
                        <label htmlFor="dateTo">Échéance Au</label>
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
                    <div className="col-12 md:col-3">
                        <Card className="bg-blue-50">
                            <div className="flex align-items-center gap-3">
                                <i className="pi pi-lock text-4xl text-blue-500"></i>
                                <div>
                                    <p className="text-500 m-0">Nombre de DAT</p>
                                    <p className="text-2xl font-bold m-0">{totals.totalDeposits}</p>
                                </div>
                            </div>
                        </Card>
                    </div>
                    <div className="col-12 md:col-3">
                        <Card className="bg-green-50">
                            <div className="flex align-items-center gap-3">
                                <i className="pi pi-wallet text-4xl text-green-500"></i>
                                <div>
                                    <p className="text-500 m-0">Capital Total</p>
                                    <p className="text-2xl font-bold m-0">{formatCurrency(totals.totalPrincipal)}</p>
                                </div>
                            </div>
                        </Card>
                    </div>
                    <div className="col-12 md:col-3">
                        <Card className="bg-purple-50">
                            <div className="flex align-items-center gap-3">
                                <i className="pi pi-chart-line text-4xl text-purple-500"></i>
                                <div>
                                    <p className="text-500 m-0">Intérêts Projetés</p>
                                    <p className="text-2xl font-bold m-0">{formatCurrency(totals.totalProjectedInterest)}</p>
                                </div>
                            </div>
                        </Card>
                    </div>
                    <div className="col-12 md:col-3">
                        <Card className="bg-orange-50">
                            <div className="flex align-items-center gap-3">
                                <i className="pi pi-percentage text-4xl text-orange-500"></i>
                                <div>
                                    <p className="text-500 m-0">Taux Moyen</p>
                                    <p className="text-2xl font-bold m-0">{totals.averageRate.toFixed(2)}%</p>
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
                    <Column field="certificateNumber" header="N° Certificat" sortable />
                    <Column field="clientName" header="Client" sortable />
                    <Column field="branchName" header="Agence" sortable />
                    <Column field="principalAmount" header="Capital" body={principalTemplate} sortable />
                    <Column field="interestRate" header="Taux" body={rateTemplate} sortable />
                    <Column field="termDuration" header="Durée" sortable />
                    <Column field="startDate" header="Date Début" sortable />
                    <Column field="maturityDate" header="Échéance" sortable />
                    <Column field="projectedInterest" header="Intérêts" body={interestTemplate} sortable />
                    <Column field="status" header="Statut" body={statusTemplate} sortable />
                    <Column field="maturityInstruction" header="Instruction" sortable />
                </DataTable>
            )}
        </div>
    );
};

export default RapportDATPage;
