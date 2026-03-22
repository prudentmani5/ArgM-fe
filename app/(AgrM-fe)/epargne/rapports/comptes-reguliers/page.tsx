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

const RapportComptesReguliersPage = () => {
    const toast = useRef<Toast>(null);

    const branchesApi = useConsumApi('');
    const accountsApi = useConsumApi('');

    const [dateFrom, setDateFrom] = useState<Date | null>(null);
    const [dateTo, setDateTo] = useState<Date | null>(null);
    const [branchId, setBranchId] = useState<number | null>(null);
    const [statusFilter, setStatusFilter] = useState<string | null>(null);
    const [branches, setBranches] = useState<any[]>([]);
    const [reportData, setReportData] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [totals, setTotals] = useState({ count: 0, totalBalance: 0, totalBlocked: 0, totalMinimum: 0 });

    const statusOptions = [
        { label: 'Actif', value: 'ACTIVE' },
        { label: 'Inactif', value: 'INACTIVE' },
        { label: 'Dormant', value: 'DORMANT' },
        { label: 'Fermé', value: 'CLOSED' },
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
            // Filter REGULAR only
            accounts = accounts.filter((a: any) => a.accountType === 'REGULAR');

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
            // Filter by status
            if (statusFilter) {
                accounts = accounts.filter((a: any) => a.status?.code === statusFilter);
            }

            setReportData(accounts);
            setTotals({
                count: accounts.length,
                totalBalance: accounts.reduce((s: number, a: any) => s + (a.currentBalance || 0), 0),
                totalBlocked: accounts.reduce((s: number, a: any) => s + (a.blockedAmount || 0), 0),
                totalMinimum: accounts.reduce((s: number, a: any) => s + (a.minimumBalance || 0), 0),
            });

            toast.current?.show({ severity: 'success', summary: 'Succès', detail: `${accounts.length} comptes trouvés` });
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

        const reportTitle = 'Rapport des Comptes Épargne Régulière';
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
                <td>${row.interestRate?.toFixed(2) || '0.00'} %</td>
                <td>${row.openingDate ? new Date(row.openingDate).toLocaleDateString('fr-FR') : '-'}</td>
                <td>${row.status?.nameFr || row.status?.name || '-'}</td>
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
                .stats { display:flex; justify-content:space-around; margin-bottom:20px; padding:15px; background:#f5f5f5; border-radius:8px; }
                .stat-box { text-align:center; }
                table { width:100%; border-collapse:collapse; margin-top:20px; font-size:10px; }
                th, td { border:1px solid #ddd; padding:6px; text-align:left; }
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
                    <div class="stat-box"><strong>Nombre de Comptes:</strong> ${totals.count}</div>
                    <div class="stat-box"><strong>Solde Total:</strong> ${formatCurrency(totals.totalBalance)}</div>
                    <div class="stat-box"><strong>Montant Bloqué:</strong> ${formatCurrency(totals.totalBlocked)}</div>
                </div>
                <table>
                    <thead><tr><th>N° Compte</th><th>Client</th><th>N° Client</th><th>Agence</th><th>Solde</th><th>Bloqué</th><th>Taux</th><th>Date Ouverture</th><th>Statut</th><th>Utilisateur</th></tr></thead>
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
        csv += 'N° Compte;Client;N° Client;Agence;Solde;Bloqué;Solde Minimum;Taux (%);Date Ouverture;Statut;Utilisateur\n';
        reportData.forEach(row => {
            const clientName = row.client?.businessName || ((row.client?.firstName || '') + ' ' + (row.client?.lastName || '')).trim() || '';
            csv += `"${row.accountNumber || ''}";"${clientName}";"${row.client?.clientNumber || ''}";"${row.branch?.name || ''}";"${row.currentBalance || 0}";"${row.blockedAmount || 0}";"${row.minimumBalance || 0}";"${row.interestRate || 0}";"${row.openingDate || ''}";"${row.status?.nameFr || ''}";"${row.userAction || ''}"\n`;
        });
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `rapport_comptes_reguliers_${new Date().toISOString().split('T')[0]}.csv`);
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
                    <i className="pi pi-book text-4xl text-primary"></i>
                    <div>
                        <h2 className="m-0">Rapport des Comptes Épargne Régulière</h2>
                        <p className="m-0 text-500">Liste des comptes d'épargne régulière créés</p>
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
                        <label>Statut</label>
                        <Dropdown value={statusFilter} options={statusOptions} onChange={(e) => setStatusFilter(e.value)} placeholder="Tous les statuts" showClear className="w-full" />
                    </div>
                </div>
                <div className="flex justify-content-end mt-3">
                    <Button label="Générer le Rapport" icon="pi pi-search" onClick={generateReport} loading={loading} />
                </div>
            </Card>

            {reportData.length > 0 && (
                <div className="grid mb-4">
                    <div className="col-12 md:col-4">
                        <Card className="bg-blue-50">
                            <div className="flex align-items-center gap-3">
                                <i className="pi pi-book text-4xl text-blue-500"></i>
                                <div>
                                    <p className="text-500 m-0">Nombre de Comptes</p>
                                    <p className="text-2xl font-bold m-0">{totals.count}</p>
                                </div>
                            </div>
                        </Card>
                    </div>
                    <div className="col-12 md:col-4">
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
                    <div className="col-12 md:col-4">
                        <Card className="bg-orange-50">
                            <div className="flex align-items-center gap-3">
                                <i className="pi pi-lock text-4xl text-orange-500"></i>
                                <div>
                                    <p className="text-500 m-0">Montant Bloqué Total</p>
                                    <p className="text-2xl font-bold m-0">{formatCurrency(totals.totalBlocked)}</p>
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
                    <Column header="N° Client" body={(row) => row.client?.clientNumber || '-'} sortable />
                    <Column field="branch.name" header="Agence" sortable />
                    <Column field="currentBalance" header="Solde" sortable body={(row) => <span className="font-bold text-blue-600">{formatCurrency(row.currentBalance || 0)}</span>} />
                    <Column field="blockedAmount" header="Bloqué" sortable body={(row) => formatCurrency(row.blockedAmount || 0)} />
                    <Column field="interestRate" header="Taux (%)" sortable body={(row) => `${(row.interestRate || 0).toFixed(2)} %`} />
                    <Column field="openingDate" header="Date Ouverture" sortable body={(row) => row.openingDate ? new Date(row.openingDate).toLocaleDateString('fr-FR') : '-'} />
                    <Column header="Statut" body={statusTemplate} sortable sortField="status.code" />
                    <Column field="userAction" header="Utilisateur" sortable />
                </DataTable>
            )}
        </div>
    );
};

export default RapportComptesReguliersPage;
