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
import useConsumApi from '@/hooks/fetchData/useConsumApi';
import { API_BASE_URL } from '@/utils/apiConfig';

const BRANCHES_URL = `${API_BASE_URL}/api/reference-data/branches`;
const ACCOUNTS_URL = `${API_BASE_URL}/api/savings-accounts`;

const RapportComptesDATPage = () => {
    const toast = useRef<Toast>(null);

    const branchesApi = useConsumApi('');
    const accountsApi = useConsumApi('');

    const [dateFrom, setDateFrom] = useState<Date | null>(null);
    const [dateTo, setDateTo] = useState<Date | null>(null);
    const [branchId, setBranchId] = useState<number | null>(null);
    const [validatedFilter, setValidatedFilter] = useState<string | null>(null);
    const [branches, setBranches] = useState<any[]>([]);
    const [reportData, setReportData] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [totals, setTotals] = useState({ count: 0, totalBalance: 0, totalBlocked: 0, totalInterest: 0, avgRate: 0 });

    const validatedOptions = [
        { label: 'Validé', value: 'true' },
        { label: 'Non Validé', value: 'false' },
    ];

    useEffect(() => {
        branchesApi.fetchData(null, 'GET', `${BRANCHES_URL}/findall`, 'loadBranches');
    }, []);

    useEffect(() => {
        if (branchesApi.data) {
            setBranches(Array.isArray(branchesApi.data) ? branchesApi.data : []);
        }
    }, [branchesApi.data]);

    useEffect(() => {
        if (accountsApi.data) {
            let accounts = Array.isArray(accountsApi.data) ? accountsApi.data : accountsApi.data?.content || [];
            // Filter TERM_DEPOSIT only
            accounts = accounts.filter((a: any) => a.accountType === 'TERM_DEPOSIT');

            // Filter by date range (openingDate)
            if (dateFrom) {
                const from = dateFrom.toISOString().split('T')[0];
                accounts = accounts.filter((a: any) => a.openingDate >= from);
            }
            if (dateTo) {
                const to = dateTo.toISOString().split('T')[0];
                accounts = accounts.filter((a: any) => a.openingDate <= to);
            }
            // Filter by branch
            if (branchId) {
                accounts = accounts.filter((a: any) => a.branch?.id === branchId);
            }
            // Filter by validated status
            if (validatedFilter !== null) {
                const isValidated = validatedFilter === 'true';
                accounts = accounts.filter((a: any) => a.termDepositValidated === isValidated);
            }

            setReportData(accounts);
            const rates = accounts.filter((a: any) => a.interestRate > 0);
            setTotals({
                count: accounts.length,
                totalBalance: accounts.reduce((s: number, a: any) => s + (a.currentBalance || 0), 0),
                totalBlocked: accounts.reduce((s: number, a: any) => s + (a.blockedAmount || 0), 0),
                totalInterest: accounts.reduce((s: number, a: any) => s + (a.accruedInterest || 0), 0),
                avgRate: rates.length > 0 ? rates.reduce((s: number, a: any) => s + (a.interestRate || 0), 0) / rates.length : 0,
            });

            toast.current?.show({ severity: 'success', summary: 'Succès', detail: `${accounts.length} comptes DAT trouvés` });
            setLoading(false);
        }
        if (accountsApi.error) {
            toast.current?.show({ severity: 'error', summary: 'Erreur', detail: 'Erreur lors du chargement des comptes' });
            setLoading(false);
        }
    }, [accountsApi.data, accountsApi.error]);

    const generateReport = () => {
        setLoading(true);
        accountsApi.fetchData(null, 'GET', `${ACCOUNTS_URL}/findall`, 'loadAccounts');
    };

    const formatCurrency = (value: number) => new Intl.NumberFormat('fr-BI', { style: 'decimal' }).format(value) + ' BIF';

    const exportToPdf = () => {
        if (reportData.length === 0) {
            toast.current?.show({ severity: 'warn', summary: 'Attention', detail: 'Aucune donnée à exporter' });
            return;
        }

        const reportTitle = 'Rapport des Comptes Dépôt à Terme';
        const dateRange = dateFrom && dateTo
            ? `Du ${dateFrom.toLocaleDateString('fr-FR')} au ${dateTo.toLocaleDateString('fr-FR')}`
            : 'Toutes les dates';

        const tableRows = reportData.map(row => `
            <tr>
                <td>${row.accountNumber || '-'}</td>
                <td>${row.client?.businessName || ((row.client?.firstName || '') + ' ' + (row.client?.lastName || '')).trim() || '-'}</td>
                <td>${row.client?.clientNumber || '-'}</td>
                <td>${row.branch?.name || '-'}</td>
                <td style="text-align:right">${formatCurrency(row.currentBalance || 0)}</td>
                <td style="text-align:right">${formatCurrency(row.blockedAmount || 0)}</td>
                <td>${(row.interestRate || 0).toFixed(2)} %</td>
                <td>${row.termDuration ? `${row.termDuration.nameFr} (${row.termDuration.months}m)` : '-'}</td>
                <td>${row.termStartDate ? new Date(row.termStartDate).toLocaleDateString('fr-FR') : '-'}</td>
                <td>${row.maturityDate ? new Date(row.maturityDate).toLocaleDateString('fr-FR') : '-'}</td>
                <td style="text-align:right">${formatCurrency(row.accruedInterest || 0)}</td>
                <td>${row.termDepositValidated ? 'Oui' : 'Non'}</td>
                <td>${row.userAction || '-'}</td>
            </tr>
        `).join('');

        const printContent = `
            <!DOCTYPE html><html><head><title>${reportTitle}</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                .header { display:flex; justify-content:space-between; align-items:center; border-bottom:2px solid #4a90a4; padding-bottom:10px; margin-bottom:20px; }
                .logo-section { display:flex; align-items:center; gap:10px; }
                .company-name { font-size:16px; font-weight:bold; color:#1e3a5f; margin:0; }
                .company-info { font-size:10px; color:#64748b; margin:2px 0 0 0; }
                .doc-title { font-size:14px; font-weight:bold; color:#1e3a5f; }
                .stats { display:flex; justify-content:space-around; margin-bottom:20px; padding:15px; background:#f5f5f5; border-radius:8px; flex-wrap:wrap; }
                .stat-box { text-align:center; margin:5px; }
                table { width:100%; border-collapse:collapse; margin-top:20px; font-size:9px; }
                th, td { border:1px solid #ddd; padding:5px; text-align:left; }
                th { background-color:#4a90a4; color:white; }
                tr:nth-child(even) { background-color:#f9f9f9; }
                .footer { margin-top:30px; text-align:center; font-size:12px; color:#999; }
                @media print { body { margin: 0; } }
            </style></head><body>
                <div class="header">
                    <div class="logo-section">
                        <img src="/layout/images/logo/logoAgrinova.PNG" alt="Logo" style="height:60px;width:60px;object-fit:contain" />
                        <div><h1 class="company-name">AgrM MICROFINANCE</h1><p class="company-info">Bujumbura, Burundi</p></div>
                    </div>
                    <div style="text-align:right">
                        <div class="doc-title">${reportTitle}</div>
                        <p style="font-size:9px;color:#64748b;margin-top:4px">${dateRange}</p>
                    </div>
                </div>
                <div class="stats">
                    <div class="stat-box"><strong>Nombre DAT:</strong> ${totals.count}</div>
                    <div class="stat-box"><strong>Capital Total:</strong> ${formatCurrency(totals.totalBalance)}</div>
                    <div class="stat-box"><strong>Montant Bloqué:</strong> ${formatCurrency(totals.totalBlocked)}</div>
                    <div class="stat-box"><strong>Intérêts Courus:</strong> ${formatCurrency(totals.totalInterest)}</div>
                    <div class="stat-box"><strong>Taux Moyen:</strong> ${totals.avgRate.toFixed(2)} %</div>
                </div>
                <table>
                    <thead><tr><th>N° Compte</th><th>Client</th><th>N° Client</th><th>Agence</th><th>Capital</th><th>Bloqué</th><th>Taux</th><th>Durée</th><th>Début</th><th>Échéance</th><th>Intérêts</th><th>Validé</th><th>Utilisateur</th></tr></thead>
                    <tbody>${tableRows}</tbody>
                </table>
                <p class="footer">Généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}</p>
            </body></html>
        `;

        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write(printContent);
            printWindow.document.close();
            printWindow.focus();
            setTimeout(() => printWindow.print(), 250);
        }
    };

    const exportToExcel = () => {
        if (reportData.length === 0) {
            toast.current?.show({ severity: 'warn', summary: 'Attention', detail: 'Aucune donnée à exporter' });
            return;
        }
        let csv = '\uFEFF';
        csv += 'N° Compte;Client;N° Client;Agence;Capital;Bloqué;Taux (%);Durée;Date Début;Échéance;Intérêts Courus;Validé;Cycle;Utilisateur\n';
        reportData.forEach(row => {
            const clientName = row.client?.businessName || ((row.client?.firstName || '') + ' ' + (row.client?.lastName || '')).trim() || '';
            const duration = row.termDuration ? `${row.termDuration.nameFr} (${row.termDuration.months}m)` : '';
            csv += `"${row.accountNumber || ''}";"${clientName}";"${row.client?.clientNumber || ''}";"${row.branch?.name || ''}";"${row.currentBalance || 0}";"${row.blockedAmount || 0}";"${row.interestRate || 0}";"${duration}";"${row.termStartDate || ''}";"${row.maturityDate || ''}";"${row.accruedInterest || 0}";"${row.termDepositValidated ? 'Oui' : 'Non'}";"${row.termDepositCount || 0}";"${row.userAction || ''}"\n`;
        });
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `rapport_comptes_dat_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.current?.show({ severity: 'success', summary: 'Export Excel', detail: 'Fichier CSV téléchargé' });
    };

    const statusTemplate = (row: any) => {
        const code = row.status?.code;
        const severity = code === 'ACTIVE' || code === 'ACTIF' ? 'success' : code === 'CLOSED' ? 'danger' : code === 'DORMANT' ? 'warning' : 'info';
        return <Tag value={row.status?.nameFr || row.status?.name || '-'} severity={severity} />;
    };

    return (
        <div className="card">
            <Toast ref={toast} />

            <div className="flex align-items-center justify-content-between mb-4">
                <div className="flex align-items-center gap-2">
                    <i className="pi pi-lock text-4xl text-primary"></i>
                    <div>
                        <h2 className="m-0">Rapport des Comptes Dépôt à Terme</h2>
                        <p className="m-0 text-500">Liste des comptes dépôt à terme créés</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button label="PDF" icon="pi pi-file-pdf" severity="danger" onClick={exportToPdf} disabled={reportData.length === 0} />
                    <Button label="Excel" icon="pi pi-file-excel" severity="success" onClick={exportToExcel} disabled={reportData.length === 0} />
                </div>
            </div>

            <Divider />

            <Card className="mb-4">
                <h5 className="m-0 mb-3"><i className="pi pi-filter mr-2"></i>Critères de Recherche</h5>
                <div className="formgrid grid">
                    <div className="field col-12 md:col-3">
                        <label>Date Ouverture Du</label>
                        <Calendar value={dateFrom} onChange={(e) => setDateFrom(e.value as Date)} dateFormat="dd/mm/yy" showIcon className="w-full" />
                    </div>
                    <div className="field col-12 md:col-3">
                        <label>Date Ouverture Au</label>
                        <Calendar value={dateTo} onChange={(e) => setDateTo(e.value as Date)} dateFormat="dd/mm/yy" showIcon className="w-full" />
                    </div>
                    <div className="field col-12 md:col-3">
                        <label>Agence</label>
                        <Dropdown value={branchId} options={branches} onChange={(e) => setBranchId(e.value)} optionLabel="name" optionValue="id" placeholder="Toutes les agences" showClear className="w-full" />
                    </div>
                    <div className="field col-12 md:col-3">
                        <label>Validation</label>
                        <Dropdown value={validatedFilter} options={validatedOptions} onChange={(e) => setValidatedFilter(e.value)} placeholder="Tous" showClear className="w-full" />
                    </div>
                </div>
                <div className="flex justify-content-end mt-3">
                    <Button label="Générer le Rapport" icon="pi pi-search" onClick={generateReport} loading={loading} />
                </div>
            </Card>

            {reportData.length > 0 && (
                <div className="grid mb-4">
                    <div className="col-12 md:col-3">
                        <Card className="bg-blue-50">
                            <div className="flex align-items-center gap-3">
                                <i className="pi pi-lock text-4xl text-blue-500"></i>
                                <div>
                                    <p className="text-500 m-0">Nombre de DAT</p>
                                    <p className="text-2xl font-bold m-0">{totals.count}</p>
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
                                    <p className="text-2xl font-bold m-0">{formatCurrency(totals.totalBalance)}</p>
                                </div>
                            </div>
                        </Card>
                    </div>
                    <div className="col-12 md:col-3">
                        <Card className="bg-purple-50">
                            <div className="flex align-items-center gap-3">
                                <i className="pi pi-chart-line text-4xl text-purple-500"></i>
                                <div>
                                    <p className="text-500 m-0">Intérêts Courus</p>
                                    <p className="text-2xl font-bold m-0">{formatCurrency(totals.totalInterest)}</p>
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
                                    <p className="text-2xl font-bold m-0">{totals.avgRate.toFixed(2)} %</p>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            )}

            {loading ? (
                <div className="flex justify-content-center p-5"><ProgressSpinner /></div>
            ) : (
                <DataTable value={reportData} paginator rows={10} rowsPerPageOptions={[10, 25, 50]} emptyMessage="Aucune donnée. Veuillez générer un rapport." className="p-datatable-sm" stripedRows>
                    <Column field="accountNumber" header="N° Compte" sortable />
                    <Column header="Client" sortable sortField="client.firstName" body={(row) => row.client?.businessName || ((row.client?.firstName || '') + ' ' + (row.client?.lastName || '')).trim() || '-'} />
                    <Column field="branch.name" header="Agence" sortable />
                    <Column field="currentBalance" header="Capital" sortable body={(row) => <span className="font-bold text-blue-600">{formatCurrency(row.currentBalance || 0)}</span>} />
                    <Column field="blockedAmount" header="Bloqué" sortable body={(row) => formatCurrency(row.blockedAmount || 0)} />
                    <Column field="interestRate" header="Taux" sortable body={(row) => <Tag value={`${(row.interestRate || 0).toFixed(2)} %`} severity="info" />} />
                    <Column header="Durée" sortable sortField="termDuration.months" body={(row) => row.termDuration ? `${row.termDuration.nameFr} (${row.termDuration.months}m)` : '-'} />
                    <Column field="termStartDate" header="Début" sortable body={(row) => row.termStartDate ? new Date(row.termStartDate).toLocaleDateString('fr-FR') : '-'} />
                    <Column field="maturityDate" header="Échéance" sortable body={(row) => row.maturityDate ? new Date(row.maturityDate).toLocaleDateString('fr-FR') : '-'} />
                    <Column field="accruedInterest" header="Intérêts" sortable body={(row) => <span className="font-bold text-green-600">{formatCurrency(row.accruedInterest || 0)}</span>} />
                    <Column header="Validé" body={(row) => row.termDepositValidated ? <Tag value="Oui" severity="success" icon="pi pi-check" /> : <Tag value="Non" severity="warning" icon="pi pi-clock" />} />
                    <Column header="Statut" body={statusTemplate} sortable sortField="status.code" />
                    <Column field="userAction" header="Utilisateur" sortable />
                </DataTable>
            )}
        </div>
    );
};

export default RapportComptesDATPage;
