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
const STATUSES_URL = `${API_BASE_URL}/api/epargne/passbook-statuses`;
const REPORTS_URL = `${API_BASE_URL}/api/epargne/reports`;

interface PassbookReport {
    id: number;
    passbookNumber: string;
    accountNumber: string;
    clientName: string;
    clientNumber: string;
    branchName: string;
    status: string;
    openingDate: string;
    currentBalance: number;
    totalDeposits: number;
    totalWithdrawals: number;
    lastTransactionDate?: string;
}

const RapportLivretsPage = () => {
    const toast = useRef<Toast>(null);

    // Separate hook instances for each data type to avoid race conditions
    const branchesApi = useConsumApi('');
    const statusesApi = useConsumApi('');
    const reportApi = useConsumApi('');

    const [dateFrom, setDateFrom] = useState<Date | null>(null);
    const [dateTo, setDateTo] = useState<Date | null>(null);
    const [branchId, setBranchId] = useState<number | null>(null);
    const [statusId, setStatusId] = useState<number | null>(null);
    const [branches, setBranches] = useState<any[]>([]);
    const [statuses, setStatuses] = useState<any[]>([]);
    const [reportData, setReportData] = useState<PassbookReport[]>([]);
    const [loading, setLoading] = useState(false);
    const [totals, setTotals] = useState({
        totalAccounts: 0,
        totalBalance: 0,
        totalDeposits: 0,
        totalWithdrawals: 0
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

    // Handle statuses data
    useEffect(() => {
        if (statusesApi.data) {
            const data = statusesApi.data;
            setStatuses(Array.isArray(data) ? data : []);
        }
        if (statusesApi.error) {
            toast.current?.show({ severity: 'error', summary: 'Erreur', detail: statusesApi.error.message || 'Erreur lors du chargement des statuts' });
        }
    }, [statusesApi.data, statusesApi.error]);

    // Handle report data
    useEffect(() => {
        if (reportApi.data) {
            const response = reportApi.data;
            setReportData(response.data || []);
            setTotals({
                totalAccounts: response.totalAccounts || 0,
                totalBalance: response.totalBalance || 0,
                totalDeposits: response.totalDeposits || 0,
                totalWithdrawals: response.totalWithdrawals || 0
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
        statusesApi.fetchData(null, 'GET', `${STATUSES_URL}/findall`, 'loadStatuses');
    };

    const generateReport = () => {
        setLoading(true);
        const params = new URLSearchParams();
        if (dateFrom) params.append('dateFrom', dateFrom.toISOString().split('T')[0]);
        if (dateTo) params.append('dateTo', dateTo.toISOString().split('T')[0]);
        if (branchId) params.append('branchId', branchId.toString());
        if (statusId) params.append('statusId', statusId.toString());

        reportApi.fetchData(null, 'GET', `${REPORTS_URL}/passbooks?${params.toString()}`, 'generateReport');
    };

    const exportToPdf = () => {
        if (reportData.length === 0) {
            toast.current?.show({ severity: 'warn', summary: 'Attention', detail: 'Aucune donnée à exporter' });
            return;
        }

        const reportTitle = 'Rapport des Livrets d\'Épargne';
        const dateRange = dateFrom && dateTo
            ? `Du ${dateFrom.toLocaleDateString('fr-FR')} au ${dateTo.toLocaleDateString('fr-FR')}`
            : 'Toutes les dates';

        const tableHeaders = `
            <th>N° Livret</th>
            <th>N° Compte</th>
            <th>Client</th>
            <th>N° Client</th>
            <th>Agence</th>
            <th>Statut</th>
            <th>Date Ouverture</th>
            <th>Solde</th>
            <th>Total Dépôts</th>
            <th>Total Retraits</th>
        `;

        const tableRows = reportData.map(row => `
            <tr>
                <td>${row.passbookNumber || '-'}</td>
                <td>${row.accountNumber || '-'}</td>
                <td>${row.clientName || '-'}</td>
                <td>${row.clientNumber || '-'}</td>
                <td>${row.branchName || '-'}</td>
                <td>${row.status || '-'}</td>
                <td>${row.openingDate || '-'}</td>
                <td style="text-align: right;">${formatCurrency(row.currentBalance || 0)}</td>
                <td style="text-align: right;">${formatCurrency(row.totalDeposits || 0)}</td>
                <td style="text-align: right;">${formatCurrency(row.totalWithdrawals || 0)}</td>
            </tr>
        `).join('');

        const statsSection = `
            <div class="stats">
                <div class="stat-box"><strong>Nombre de Livrets:</strong> ${totals.totalAccounts}</div>
                <div class="stat-box"><strong>Solde Total:</strong> ${formatCurrency(totals.totalBalance)}</div>
                <div class="stat-box"><strong>Total Dépôts:</strong> ${formatCurrency(totals.totalDeposits)}</div>
                <div class="stat-box"><strong>Total Retraits:</strong> ${formatCurrency(totals.totalWithdrawals)}</div>
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

        const headers = ['N° Livret', 'N° Compte', 'Client', 'N° Client', 'Agence', 'Statut', 'Date Ouverture', 'Solde', 'Total Dépôts', 'Total Retraits', 'Dernière Transaction'];
        const rows = reportData.map(row => [
            row.passbookNumber || '',
            row.accountNumber || '',
            row.clientName || '',
            row.clientNumber || '',
            row.branchName || '',
            row.status || '',
            row.openingDate || '',
            String(row.currentBalance || 0),
            String(row.totalDeposits || 0),
            String(row.totalWithdrawals || 0),
            row.lastTransactionDate || ''
        ]);

        // Create CSV content with BOM for Excel UTF-8 support
        let csvContent = '\uFEFF' + headers.join(';') + '\n';
        rows.forEach(row => {
            csvContent += row.map(cell => `"${cell}"`).join(';') + '\n';
        });

        // Add totals row
        csvContent += '\n';
        csvContent += `"Total Livrets";"${totals.totalAccounts}";;;;"Solde Total";"${totals.totalBalance}";;"Total Dépôts";"${totals.totalDeposits}";"Total Retraits";"${totals.totalWithdrawals}"\n`;

        // Create and download the file
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `rapport_livrets_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        toast.current?.show({ severity: 'success', summary: 'Export Excel', detail: 'Le fichier CSV a été téléchargé avec succès' });
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('fr-BI', { style: 'decimal' }).format(value) + ' FBU';
    };

    const balanceTemplate = (rowData: PassbookReport) => {
        return <span className="font-bold text-green-600">{formatCurrency(rowData.currentBalance)}</span>;
    };

    const statusTemplate = (rowData: PassbookReport) => {
        const getSeverity = (status: string) => {
            switch (status?.toUpperCase()) {
                case 'ACTIF': return 'success';
                case 'INACTIF': return 'warning';
                case 'BLOQUÉ': return 'danger';
                case 'FERMÉ': return 'secondary';
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
                    <i className="pi pi-book text-4xl text-primary"></i>
                    <div>
                        <h2 className="m-0">Rapport des Livrets d'Épargne</h2>
                        <p className="m-0 text-500">État des comptes d'épargne et mouvements</p>
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
                            value={statusId}
                            options={statuses}
                            onChange={(e) => setStatusId(e.value)}
                            optionLabel="name"
                            optionValue="id"
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
                                <i className="pi pi-book text-4xl text-blue-500"></i>
                                <div>
                                    <p className="text-500 m-0">Nombre de Livrets</p>
                                    <p className="text-2xl font-bold m-0">{totals.totalAccounts}</p>
                                </div>
                            </div>
                        </Card>
                    </div>
                    <div className="col-12 md:col-3">
                        <Card className="bg-green-50">
                            <div className="flex align-items-center gap-3">
                                <i className="pi pi-wallet text-4xl text-green-500"></i>
                                <div>
                                    <p className="text-500 m-0">Solde Total</p>
                                    <p className="text-2xl font-bold m-0">{formatCurrency(totals.totalBalance)}</p>
                                </div>
                            </div>
                        </Card>
                    </div>
                    <div className="col-12 md:col-3">
                        <Card className="bg-cyan-50">
                            <div className="flex align-items-center gap-3">
                                <i className="pi pi-arrow-down text-4xl text-cyan-500"></i>
                                <div>
                                    <p className="text-500 m-0">Total Dépôts</p>
                                    <p className="text-2xl font-bold m-0">{formatCurrency(totals.totalDeposits)}</p>
                                </div>
                            </div>
                        </Card>
                    </div>
                    <div className="col-12 md:col-3">
                        <Card className="bg-orange-50">
                            <div className="flex align-items-center gap-3">
                                <i className="pi pi-arrow-up text-4xl text-orange-500"></i>
                                <div>
                                    <p className="text-500 m-0">Total Retraits</p>
                                    <p className="text-2xl font-bold m-0">{formatCurrency(totals.totalWithdrawals)}</p>
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
                    <Column field="passbookNumber" header="N° Livret" sortable />
                    <Column field="accountNumber" header="N° Compte" sortable />
                    <Column field="clientName" header="Client" sortable />
                    <Column field="clientNumber" header="N° Client" sortable />
                    <Column field="branchName" header="Agence" sortable />
                    <Column field="status" header="Statut" body={statusTemplate} sortable />
                    <Column field="openingDate" header="Date Ouverture" sortable />
                    <Column field="currentBalance" header="Solde" body={balanceTemplate} sortable />
                    <Column field="totalDeposits" header="Total Dépôts" body={(row) => formatCurrency(row.totalDeposits)} sortable />
                    <Column field="totalWithdrawals" header="Total Retraits" body={(row) => formatCurrency(row.totalWithdrawals)} sortable />
                </DataTable>
            )}
        </div>
    );
};

export default RapportLivretsPage;
