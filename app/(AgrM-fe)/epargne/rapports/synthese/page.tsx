'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { Calendar } from 'primereact/calendar';
import { Dropdown } from 'primereact/dropdown';
import { Toast } from 'primereact/toast';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Divider } from 'primereact/divider';
import { Chart } from 'primereact/chart';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import useConsumApi from '../../../../../hooks/fetchData/useConsumApi';
import { API_BASE_URL } from '../../../../../utils/apiConfig';

const BRANCHES_URL = `${API_BASE_URL}/api/reference-data/branches`;
const REPORTS_URL = `${API_BASE_URL}/api/epargne/reports`;

interface SynthesisData {
    // Totaux généraux
    totalSavingsAccounts: number;
    totalSavingsBalance: number;
    totalTermDeposits: number;
    totalTermDepositsAmount: number;
    totalTontineGroups: number;
    totalTontineMembers: number;
    totalTontineCollected: number;
    totalCompulsorySavings: number;
    totalCompulsorySavingsBlocked: number;

    // Mouvements période
    depositsCount: number;
    depositsAmount: number;
    withdrawalsCount: number;
    withdrawalsAmount: number;
    netFlow: number;

    // Par agence
    branchData: BranchSummary[];

    // Évolution mensuelle
    monthlyData: MonthlyData[];
}

interface BranchSummary {
    branchName: string;
    savingsAccounts: number;
    savingsBalance: number;
    termDeposits: number;
    termDepositsAmount: number;
    tontineGroups: number;
    depositsAmount: number;
    withdrawalsAmount: number;
}

interface MonthlyData {
    month: string;
    deposits: number;
    withdrawals: number;
    netFlow: number;
}

const RapportSynthesePage = () => {
    const toast = useRef<Toast>(null);

    // Separate hook instances for each data type to avoid race conditions
    const branchesApi = useConsumApi('');
    const reportApi = useConsumApi('');

    const [dateFrom, setDateFrom] = useState<Date | null>(null);
    const [dateTo, setDateTo] = useState<Date | null>(null);
    const [branchId, setBranchId] = useState<number | null>(null);
    const [branches, setBranches] = useState<any[]>([]);
    const [data, setData] = useState<SynthesisData | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadReferenceData();
    }, []);

    // Handle branches data
    useEffect(() => {
        if (branchesApi.data) {
            const apiData = branchesApi.data;
            setBranches(Array.isArray(apiData) ? apiData : []);
        }
        if (branchesApi.error) {
            toast.current?.show({ severity: 'error', summary: 'Erreur', detail: branchesApi.error.message || 'Erreur lors du chargement des agences' });
        }
    }, [branchesApi.data, branchesApi.error]);

    // Handle report data
    useEffect(() => {
        if (reportApi.data) {
            setData(reportApi.data);
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

        reportApi.fetchData(null, 'GET', `${REPORTS_URL}/synthesis?${params.toString()}`, 'generateReport');
    };

    const exportToPdf = () => {
        if (!data) {
            toast.current?.show({ severity: 'warn', summary: 'Attention', detail: 'Aucune donnée à exporter' });
            return;
        }

        const reportTitle = 'Synthèse Générale Épargne';
        const dateRange = dateFrom && dateTo
            ? `Du ${dateFrom.toLocaleDateString('fr-FR')} au ${dateTo.toLocaleDateString('fr-FR')}`
            : 'Toutes les dates';

        const branchTableHeaders = `
            <th>Agence</th>
            <th>Comptes Épargne</th>
            <th>Solde Épargne</th>
            <th>DAT</th>
            <th>Montant DAT</th>
            <th>Groupes Tontine</th>
            <th>Dépôts Période</th>
            <th>Retraits Période</th>
        `;

        const branchTableRows = data.branchData?.map(row => `
            <tr>
                <td>${row.branchName || '-'}</td>
                <td>${row.savingsAccounts || 0}</td>
                <td style="text-align: right;">${formatCurrency(row.savingsBalance || 0)}</td>
                <td>${row.termDeposits || 0}</td>
                <td style="text-align: right;">${formatCurrency(row.termDepositsAmount || 0)}</td>
                <td>${row.tontineGroups || 0}</td>
                <td style="text-align: right;">${formatCurrency(row.depositsAmount || 0)}</td>
                <td style="text-align: right;">${formatCurrency(row.withdrawalsAmount || 0)}</td>
            </tr>
        `).join('') || '';

        const printContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>${reportTitle}</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    h1 { color: #333; text-align: center; }
                    h2 { color: #666; font-size: 16px; margin-top: 30px; }
                    .date-range { text-align: center; color: #666; margin-bottom: 20px; }
                    .kpi-container { display: flex; justify-content: space-around; margin-bottom: 30px; flex-wrap: wrap; }
                    .kpi-box { padding: 15px; border-radius: 8px; text-align: center; min-width: 200px; margin: 10px; }
                    .kpi-box.blue { background: #e3f2fd; }
                    .kpi-box.green { background: #e8f5e9; }
                    .kpi-box.purple { background: #f3e5f5; }
                    .kpi-box.orange { background: #fff3e0; }
                    .kpi-title { font-size: 12px; color: #666; margin-bottom: 5px; }
                    .kpi-value { font-size: 18px; font-weight: bold; color: #333; }
                    .kpi-amount { font-size: 14px; font-weight: bold; color: #2e7d32; }
                    .movement-container { display: flex; justify-content: space-around; margin-bottom: 30px; }
                    .movement-box { padding: 20px; border: 1px solid #ddd; border-radius: 8px; text-align: center; min-width: 150px; }
                    .movement-box.deposits { border-color: #4caf50; }
                    .movement-box.withdrawals { border-color: #ff9800; }
                    .movement-box.net { border-color: #2196f3; }
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

                <h2>Indicateurs Clés</h2>
                <div class="kpi-container">
                    <div class="kpi-box blue">
                        <div class="kpi-title">Épargne Libre</div>
                        <div class="kpi-value">${data.totalSavingsAccounts} comptes</div>
                        <div class="kpi-amount">${formatCurrency(data.totalSavingsBalance)}</div>
                    </div>
                    <div class="kpi-box green">
                        <div class="kpi-title">Dépôts à Terme</div>
                        <div class="kpi-value">${data.totalTermDeposits} DAT</div>
                        <div class="kpi-amount">${formatCurrency(data.totalTermDepositsAmount)}</div>
                    </div>
                    <div class="kpi-box purple">
                        <div class="kpi-title">Tontine</div>
                        <div class="kpi-value">${data.totalTontineGroups} groupes / ${data.totalTontineMembers} membres</div>
                        <div class="kpi-amount">${formatCurrency(data.totalTontineCollected)}</div>
                    </div>
                    <div class="kpi-box orange">
                        <div class="kpi-title">Épargne Obligatoire</div>
                        <div class="kpi-value">${data.totalCompulsorySavings} comptes</div>
                        <div class="kpi-amount">${formatCurrency(data.totalCompulsorySavingsBlocked)}</div>
                    </div>
                </div>

                <h2>Mouvements de la Période</h2>
                <div class="movement-container">
                    <div class="movement-box deposits">
                        <div class="kpi-title">Dépôts</div>
                        <div class="kpi-value" style="color: #4caf50;">${formatCurrency(data.depositsAmount)}</div>
                        <div class="kpi-title">${data.depositsCount} opérations</div>
                    </div>
                    <div class="movement-box withdrawals">
                        <div class="kpi-title">Retraits</div>
                        <div class="kpi-value" style="color: #ff9800;">${formatCurrency(data.withdrawalsAmount)}</div>
                        <div class="kpi-title">${data.withdrawalsCount} opérations</div>
                    </div>
                    <div class="movement-box net">
                        <div class="kpi-title">Flux Net</div>
                        <div class="kpi-value" style="color: ${data.netFlow >= 0 ? '#2196f3' : '#f44336'};">${formatCurrency(data.netFlow)}</div>
                        <div class="kpi-title">${data.netFlow >= 0 ? 'Entrée nette' : 'Sortie nette'}</div>
                    </div>
                </div>

                <h2>Synthèse par Agence</h2>
                <table>
                    <thead><tr>${branchTableHeaders}</tr></thead>
                    <tbody>${branchTableRows}</tbody>
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
        if (!data) {
            toast.current?.show({ severity: 'warn', summary: 'Attention', detail: 'Aucune donnée à exporter' });
            return;
        }

        // Create CSV content with BOM for Excel UTF-8 support
        let csvContent = '\uFEFF';

        // Indicateurs clés section
        csvContent += 'INDICATEURS CLES\n';
        csvContent += 'Type;Nombre;Montant\n';
        csvContent += `"Épargne Libre";"${data.totalSavingsAccounts} comptes";"${data.totalSavingsBalance}"\n`;
        csvContent += `"Dépôts à Terme";"${data.totalTermDeposits} DAT";"${data.totalTermDepositsAmount}"\n`;
        csvContent += `"Tontine";"${data.totalTontineGroups} groupes / ${data.totalTontineMembers} membres";"${data.totalTontineCollected}"\n`;
        csvContent += `"Épargne Obligatoire";"${data.totalCompulsorySavings} comptes";"${data.totalCompulsorySavingsBlocked}"\n`;
        csvContent += '\n';

        // Mouvements section
        csvContent += 'MOUVEMENTS DE LA PERIODE\n';
        csvContent += 'Type;Montant;Operations\n';
        csvContent += `"Dépôts";"${data.depositsAmount}";"${data.depositsCount}"\n`;
        csvContent += `"Retraits";"${data.withdrawalsAmount}";"${data.withdrawalsCount}"\n`;
        csvContent += `"Flux Net";"${data.netFlow}";"${data.netFlow >= 0 ? 'Entrée nette' : 'Sortie nette'}"\n`;
        csvContent += '\n';

        // Branch data section
        if (data.branchData && data.branchData.length > 0) {
            csvContent += 'SYNTHESE PAR AGENCE\n';
            csvContent += 'Agence;Comptes Épargne;Solde Épargne;DAT;Montant DAT;Groupes Tontine;Dépôts Période;Retraits Période\n';
            data.branchData.forEach(row => {
                csvContent += `"${row.branchName || ''}";"${row.savingsAccounts || 0}";"${row.savingsBalance || 0}";"${row.termDeposits || 0}";"${row.termDepositsAmount || 0}";"${row.tontineGroups || 0}";"${row.depositsAmount || 0}";"${row.withdrawalsAmount || 0}"\n`;
            });
        }

        // Create and download the file
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `synthese_epargne_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        toast.current?.show({ severity: 'success', summary: 'Export Excel', detail: 'Le fichier CSV a été téléchargé avec succès' });
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('fr-BI', { style: 'decimal' }).format(value) + ' FBU';
    };

    const chartData = data?.monthlyData ? {
        labels: data.monthlyData.map(m => m.month),
        datasets: [
            {
                label: 'Dépôts',
                backgroundColor: '#22c55e',
                data: data.monthlyData.map(m => m.deposits)
            },
            {
                label: 'Retraits',
                backgroundColor: '#f97316',
                data: data.monthlyData.map(m => m.withdrawals)
            },
            {
                label: 'Flux Net',
                backgroundColor: '#3b82f6',
                type: 'line',
                data: data.monthlyData.map(m => m.netFlow)
            }
        ]
    } : null;

    const pieData = data ? {
        labels: ['Épargne Libre', 'Dépôts à Terme', 'Tontine', 'Épargne Obligatoire'],
        datasets: [
            {
                data: [
                    data.totalSavingsBalance,
                    data.totalTermDepositsAmount,
                    data.totalTontineCollected,
                    data.totalCompulsorySavingsBlocked
                ],
                backgroundColor: ['#3b82f6', '#22c55e', '#a855f7', '#f97316']
            }
        ]
    } : null;

    return (
        <div className="card">
            <Toast ref={toast} />

            <div className="flex align-items-center justify-content-between mb-4">
                <div className="flex align-items-center gap-2">
                    <i className="pi pi-chart-pie text-4xl text-primary"></i>
                    <div>
                        <h2 className="m-0">Synthèse Générale Épargne</h2>
                        <p className="m-0 text-500">Vue consolidée de tous les produits d'épargne</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button label="PDF" icon="pi pi-file-pdf" severity="danger" onClick={exportToPdf} disabled={!data} />
                    <Button label="Excel" icon="pi pi-file-excel" severity="success" onClick={exportToExcel} disabled={!data} />
                </div>
            </div>

            <Divider />

            {/* Filtres */}
            <Card className="mb-4">
                <h5 className="m-0 mb-3">
                    <i className="pi pi-filter mr-2"></i>
                    Période de Rapport
                </h5>
                <div className="formgrid grid">
                    <div className="field col-12 md:col-4">
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
                    <div className="field col-12 md:col-4">
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
                    <div className="field col-12 md:col-4">
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
                </div>
                <div className="flex justify-content-end mt-3">
                    <Button
                        label="Générer la Synthèse"
                        icon="pi pi-search"
                        onClick={generateReport}
                        loading={loading}
                    />
                </div>
            </Card>

            {loading ? (
                <div className="flex justify-content-center p-5">
                    <ProgressSpinner />
                </div>
            ) : data ? (
                <>
                    {/* KPIs Principaux */}
                    <div className="grid mb-4">
                        <div className="col-12 md:col-3">
                            <Card className="h-full bg-blue-50 border-left-3 border-blue-500">
                                <div className="flex align-items-center gap-3">
                                    <i className="pi pi-book text-4xl text-blue-500"></i>
                                    <div>
                                        <p className="text-500 m-0 text-sm">Épargne Libre</p>
                                        <p className="text-xl font-bold m-0">{data.totalSavingsAccounts} comptes</p>
                                        <p className="text-green-600 font-bold m-0">{formatCurrency(data.totalSavingsBalance)}</p>
                                    </div>
                                </div>
                            </Card>
                        </div>
                        <div className="col-12 md:col-3">
                            <Card className="h-full bg-green-50 border-left-3 border-green-500">
                                <div className="flex align-items-center gap-3">
                                    <i className="pi pi-lock text-4xl text-green-500"></i>
                                    <div>
                                        <p className="text-500 m-0 text-sm">Dépôts à Terme</p>
                                        <p className="text-xl font-bold m-0">{data.totalTermDeposits} DAT</p>
                                        <p className="text-green-600 font-bold m-0">{formatCurrency(data.totalTermDepositsAmount)}</p>
                                    </div>
                                </div>
                            </Card>
                        </div>
                        <div className="col-12 md:col-3">
                            <Card className="h-full bg-purple-50 border-left-3 border-purple-500">
                                <div className="flex align-items-center gap-3">
                                    <i className="pi pi-users text-4xl text-purple-500"></i>
                                    <div>
                                        <p className="text-500 m-0 text-sm">Tontine</p>
                                        <p className="text-xl font-bold m-0">{data.totalTontineGroups} groupes / {data.totalTontineMembers} membres</p>
                                        <p className="text-purple-600 font-bold m-0">{formatCurrency(data.totalTontineCollected)}</p>
                                    </div>
                                </div>
                            </Card>
                        </div>
                        <div className="col-12 md:col-3">
                            <Card className="h-full bg-orange-50 border-left-3 border-orange-500">
                                <div className="flex align-items-center gap-3">
                                    <i className="pi pi-link text-4xl text-orange-500"></i>
                                    <div>
                                        <p className="text-500 m-0 text-sm">Épargne Obligatoire</p>
                                        <p className="text-xl font-bold m-0">{data.totalCompulsorySavings} comptes</p>
                                        <p className="text-orange-600 font-bold m-0">{formatCurrency(data.totalCompulsorySavingsBlocked)}</p>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    </div>

                    {/* Mouvements de la période */}
                    <div className="grid mb-4">
                        <div className="col-12 md:col-4">
                            <Card className="text-center">
                                <i className="pi pi-arrow-down text-5xl text-green-500"></i>
                                <h4 className="text-green-600">Dépôts</h4>
                                <p className="text-2xl font-bold m-0">{formatCurrency(data.depositsAmount)}</p>
                                <p className="text-500">{data.depositsCount} opérations</p>
                            </Card>
                        </div>
                        <div className="col-12 md:col-4">
                            <Card className="text-center">
                                <i className="pi pi-arrow-up text-5xl text-orange-500"></i>
                                <h4 className="text-orange-600">Retraits</h4>
                                <p className="text-2xl font-bold m-0">{formatCurrency(data.withdrawalsAmount)}</p>
                                <p className="text-500">{data.withdrawalsCount} opérations</p>
                            </Card>
                        </div>
                        <div className="col-12 md:col-4">
                            <Card className="text-center">
                                <i className={`pi ${data.netFlow >= 0 ? 'pi-arrow-up' : 'pi-arrow-down'} text-5xl ${data.netFlow >= 0 ? 'text-blue-500' : 'text-red-500'}`}></i>
                                <h4 className={data.netFlow >= 0 ? 'text-blue-600' : 'text-red-600'}>Flux Net</h4>
                                <p className="text-2xl font-bold m-0">{formatCurrency(data.netFlow)}</p>
                                <p className="text-500">{data.netFlow >= 0 ? 'Entrée nette' : 'Sortie nette'}</p>
                            </Card>
                        </div>
                    </div>

                    {/* Graphiques */}
                    <div className="grid mb-4">
                        <div className="col-12 md:col-8">
                            <Card>
                                <h5 className="m-0 mb-3">
                                    <i className="pi pi-chart-bar mr-2"></i>
                                    Évolution Mensuelle des Flux
                                </h5>
                                {chartData && (
                                    <Chart type="bar" data={chartData} options={{
                                        plugins: { legend: { position: 'bottom' } },
                                        scales: { y: { beginAtZero: true } }
                                    }} />
                                )}
                            </Card>
                        </div>
                        <div className="col-12 md:col-4">
                            <Card>
                                <h5 className="m-0 mb-3">
                                    <i className="pi pi-chart-pie mr-2"></i>
                                    Répartition par Type
                                </h5>
                                {pieData && (
                                    <Chart type="pie" data={pieData} options={{
                                        plugins: { legend: { position: 'bottom' } }
                                    }} />
                                )}
                            </Card>
                        </div>
                    </div>

                    {/* Tableau par agence */}
                    {data.branchData && data.branchData.length > 0 && (
                        <Card>
                            <h5 className="m-0 mb-3">
                                <i className="pi pi-building mr-2"></i>
                                Synthèse par Agence
                            </h5>
                            <DataTable
                                value={data.branchData}
                                className="p-datatable-sm"
                                stripedRows
                            >
                                <Column field="branchName" header="Agence" sortable />
                                <Column field="savingsAccounts" header="Comptes Épargne" sortable />
                                <Column field="savingsBalance" header="Solde Épargne" body={(row) => formatCurrency(row.savingsBalance)} sortable />
                                <Column field="termDeposits" header="DAT" sortable />
                                <Column field="termDepositsAmount" header="Montant DAT" body={(row) => formatCurrency(row.termDepositsAmount)} sortable />
                                <Column field="tontineGroups" header="Groupes Tontine" sortable />
                                <Column field="depositsAmount" header="Dépôts Période" body={(row) => formatCurrency(row.depositsAmount)} sortable />
                                <Column field="withdrawalsAmount" header="Retraits Période" body={(row) => formatCurrency(row.withdrawalsAmount)} sortable />
                            </DataTable>
                        </Card>
                    )}
                </>
            ) : (
                <Card className="text-center p-5">
                    <i className="pi pi-chart-pie text-6xl text-300 mb-4"></i>
                    <h4 className="text-500">Aucune donnée</h4>
                    <p className="text-500">Sélectionnez une période et cliquez sur "Générer la Synthèse" pour afficher le rapport.</p>
                </Card>
            )}
        </div>
    );
};

export default RapportSynthesePage;
