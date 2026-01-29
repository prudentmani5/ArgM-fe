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

interface CompulsorySavingsReport {
    id: number;
    accountNumber: string;
    clientName: string;
    clientNumber: string;
    branchName: string;
    loanNumber: string;
    loanAmount: number;
    savingsPercentage: number;
    requiredAmount: number;
    currentBalance: number;
    blockedAmount: number;
    releasedAmount: number;
    status: string;
    loanStatus: string;
    startDate: string;
    releaseDate?: string;
}

const RapportEpargneObligatoirePage = () => {
    const toast = useRef<Toast>(null);

    // Separate hook instances for each data type to avoid race conditions
    const branchesApi = useConsumApi('');
    const reportApi = useConsumApi('');

    const [dateFrom, setDateFrom] = useState<Date | null>(null);
    const [dateTo, setDateTo] = useState<Date | null>(null);
    const [branchId, setBranchId] = useState<number | null>(null);
    const [status, setStatus] = useState<string | null>(null);
    const [branches, setBranches] = useState<any[]>([]);
    const [reportData, setReportData] = useState<CompulsorySavingsReport[]>([]);
    const [loading, setLoading] = useState(false);
    const [totals, setTotals] = useState({
        totalAccounts: 0,
        totalBlocked: 0,
        totalReleased: 0,
        totalLinkedLoans: 0,
        averagePercentage: 0
    });

    const statusOptions = [
        { label: 'Actif (Crédit en cours)', value: 'ACTIVE' },
        { label: 'Libéré (Crédit remboursé)', value: 'RELEASED' },
        { label: 'Saisi (Crédit en défaut)', value: 'SEIZED' }
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
                totalAccounts: response.totalAccounts || 0,
                totalBlocked: response.totalBlocked || 0,
                totalReleased: response.totalReleased || 0,
                totalLinkedLoans: response.totalLinkedLoans || 0,
                averagePercentage: response.averagePercentage || 0
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

        reportApi.fetchData(null, 'GET', `${REPORTS_URL}/compulsory-savings?${params.toString()}`, 'generateReport');
    };

    const exportToPdf = () => {
        if (reportData.length === 0) {
            toast.current?.show({ severity: 'warn', summary: 'Attention', detail: 'Aucune donnée à exporter' });
            return;
        }

        const reportTitle = 'Rapport Épargne Obligatoire';
        const dateRange = dateFrom && dateTo
            ? `Du ${dateFrom.toLocaleDateString('fr-FR')} au ${dateTo.toLocaleDateString('fr-FR')}`
            : 'Toutes les dates';

        const tableHeaders = `
            <th>N° Compte</th>
            <th>Client</th>
            <th>Agence</th>
            <th>N° Crédit</th>
            <th>Montant Crédit</th>
            <th>%</th>
            <th>Montant Bloqué</th>
            <th>Solde Actuel</th>
            <th>Statut Épargne</th>
            <th>Statut Crédit</th>
            <th>Début</th>
            <th>Libération</th>
        `;

        const tableRows = reportData.map(row => `
            <tr>
                <td>${row.accountNumber || '-'}</td>
                <td>${row.clientName || '-'}</td>
                <td>${row.branchName || '-'}</td>
                <td>${row.loanNumber || '-'}</td>
                <td style="text-align: right;">${formatCurrency(row.loanAmount || 0)}</td>
                <td>${row.savingsPercentage || 0}%</td>
                <td style="text-align: right;">${formatCurrency(row.blockedAmount || 0)}</td>
                <td style="text-align: right;">${formatCurrency(row.currentBalance || 0)}</td>
                <td>${row.status || '-'}</td>
                <td>${row.loanStatus || '-'}</td>
                <td>${row.startDate || '-'}</td>
                <td>${row.releaseDate || '-'}</td>
            </tr>
        `).join('');

        const statsSection = `
            <div class="stats">
                <div class="stat-box"><strong>Comptes:</strong> ${totals.totalAccounts}</div>
                <div class="stat-box"><strong>Total Bloqué:</strong> ${formatCurrency(totals.totalBlocked)}</div>
                <div class="stat-box"><strong>Total Libéré:</strong> ${formatCurrency(totals.totalReleased)}</div>
                <div class="stat-box"><strong>Crédits Liés:</strong> ${totals.totalLinkedLoans}</div>
                <div class="stat-box"><strong>Taux Moyen:</strong> ${totals.averagePercentage.toFixed(1)}%</div>
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
                    .stats { display: flex; justify-content: space-around; margin-bottom: 20px; padding: 15px; background: #f5f5f5; border-radius: 8px; flex-wrap: wrap; }
                    .stat-box { text-align: center; margin: 5px; }
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

        const headers = ['N° Compte', 'Client', 'N° Client', 'Agence', 'N° Crédit', 'Montant Crédit', '%', 'Montant Requis', 'Solde Actuel', 'Montant Bloqué', 'Montant Libéré', 'Statut Épargne', 'Statut Crédit', 'Date Début', 'Date Libération'];
        const rows = reportData.map(row => [
            row.accountNumber || '',
            row.clientName || '',
            row.clientNumber || '',
            row.branchName || '',
            row.loanNumber || '',
            String(row.loanAmount || 0),
            String(row.savingsPercentage || 0),
            String(row.requiredAmount || 0),
            String(row.currentBalance || 0),
            String(row.blockedAmount || 0),
            String(row.releasedAmount || 0),
            row.status || '',
            row.loanStatus || '',
            row.startDate || '',
            row.releaseDate || ''
        ]);

        // Create CSV content with BOM for Excel UTF-8 support
        let csvContent = '\uFEFF' + headers.join(';') + '\n';
        rows.forEach(row => {
            csvContent += row.map(cell => `"${cell}"`).join(';') + '\n';
        });

        // Add totals row
        csvContent += '\n';
        csvContent += `"Total Comptes";"${totals.totalAccounts}";;"Total Bloqué";"${totals.totalBlocked}";;"Total Libéré";"${totals.totalReleased}";;;\n`;

        // Create and download the file
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `rapport_epargne_obligatoire_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        toast.current?.show({ severity: 'success', summary: 'Export Excel', detail: 'Le fichier CSV a été téléchargé avec succès' });
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('fr-BI', { style: 'decimal' }).format(value) + ' FBU';
    };

    const loanAmountTemplate = (rowData: CompulsorySavingsReport) => {
        return <span className="font-bold text-blue-600">{formatCurrency(rowData.loanAmount)}</span>;
    };

    const blockedTemplate = (rowData: CompulsorySavingsReport) => {
        return <span className="font-bold text-orange-600">{formatCurrency(rowData.blockedAmount)}</span>;
    };

    const balanceTemplate = (rowData: CompulsorySavingsReport) => {
        return <span className="font-bold text-green-600">{formatCurrency(rowData.currentBalance)}</span>;
    };

    const percentageTemplate = (rowData: CompulsorySavingsReport) => {
        return <Tag value={`${rowData.savingsPercentage}%`} severity="info" />;
    };

    const statusTemplate = (rowData: CompulsorySavingsReport) => {
        const getSeverity = (status: string) => {
            switch (status?.toUpperCase()) {
                case 'ACTIVE': return 'warning';
                case 'RELEASED': return 'success';
                case 'SEIZED': return 'danger';
                default: return 'info';
            }
        };
        const labels: { [key: string]: string } = {
            'ACTIVE': 'Actif',
            'RELEASED': 'Libéré',
            'SEIZED': 'Saisi'
        };
        return <Tag value={labels[rowData.status] || rowData.status} severity={getSeverity(rowData.status)} />;
    };

    const loanStatusTemplate = (rowData: CompulsorySavingsReport) => {
        const getSeverity = (status: string) => {
            switch (status?.toUpperCase()) {
                case 'ACTIVE': case 'EN_COURS': return 'info';
                case 'PAID': case 'REMBOURSE': return 'success';
                case 'DEFAULT': case 'DEFAUT': return 'danger';
                case 'WRITTEN_OFF': return 'danger';
                default: return 'warning';
            }
        };
        return <Tag value={rowData.loanStatus} severity={getSeverity(rowData.loanStatus)} />;
    };

    return (
        <div className="card">
            <Toast ref={toast} />

            <div className="flex align-items-center justify-content-between mb-4">
                <div className="flex align-items-center gap-2">
                    <i className="pi pi-link text-4xl text-primary"></i>
                    <div>
                        <h2 className="m-0">Rapport Épargne Obligatoire</h2>
                        <p className="m-0 text-500">État des comptes d'épargne liés aux crédits</p>
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
                    <div className="col-12 md:col-2">
                        <Card className="bg-blue-50">
                            <div className="text-center">
                                <i className="pi pi-book text-3xl text-blue-500"></i>
                                <p className="text-500 m-0 mt-2">Comptes</p>
                                <p className="text-2xl font-bold m-0">{totals.totalAccounts}</p>
                            </div>
                        </Card>
                    </div>
                    <div className="col-12 md:col-3">
                        <Card className="bg-orange-50">
                            <div className="text-center">
                                <i className="pi pi-lock text-3xl text-orange-500"></i>
                                <p className="text-500 m-0 mt-2">Total Bloqué</p>
                                <p className="text-xl font-bold m-0">{formatCurrency(totals.totalBlocked)}</p>
                            </div>
                        </Card>
                    </div>
                    <div className="col-12 md:col-3">
                        <Card className="bg-green-50">
                            <div className="text-center">
                                <i className="pi pi-unlock text-3xl text-green-500"></i>
                                <p className="text-500 m-0 mt-2">Total Libéré</p>
                                <p className="text-xl font-bold m-0">{formatCurrency(totals.totalReleased)}</p>
                            </div>
                        </Card>
                    </div>
                    <div className="col-12 md:col-2">
                        <Card className="bg-purple-50">
                            <div className="text-center">
                                <i className="pi pi-briefcase text-3xl text-purple-500"></i>
                                <p className="text-500 m-0 mt-2">Crédits Liés</p>
                                <p className="text-2xl font-bold m-0">{totals.totalLinkedLoans}</p>
                            </div>
                        </Card>
                    </div>
                    <div className="col-12 md:col-2">
                        <Card className="bg-cyan-50">
                            <div className="text-center">
                                <i className="pi pi-percentage text-3xl text-cyan-500"></i>
                                <p className="text-500 m-0 mt-2">Taux Moyen</p>
                                <p className="text-2xl font-bold m-0">{totals.averagePercentage.toFixed(1)}%</p>
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
                    <Column field="accountNumber" header="N° Compte" sortable />
                    <Column field="clientName" header="Client" sortable />
                    <Column field="branchName" header="Agence" sortable />
                    <Column field="loanNumber" header="N° Crédit" sortable />
                    <Column field="loanAmount" header="Montant Crédit" body={loanAmountTemplate} sortable />
                    <Column field="savingsPercentage" header="%" body={percentageTemplate} sortable />
                    <Column field="blockedAmount" header="Montant Bloqué" body={blockedTemplate} sortable />
                    <Column field="currentBalance" header="Solde Actuel" body={balanceTemplate} sortable />
                    <Column field="status" header="Statut Épargne" body={statusTemplate} sortable />
                    <Column field="loanStatus" header="Statut Crédit" body={loanStatusTemplate} sortable />
                    <Column field="startDate" header="Début" sortable />
                    <Column field="releaseDate" header="Libération" sortable />
                </DataTable>
            )}
        </div>
    );
};

export default RapportEpargneObligatoirePage;
