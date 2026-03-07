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
import { TabView, TabPanel } from 'primereact/tabview';
import useConsumApi from '@/hooks/fetchData/useConsumApi';
import { API_BASE_URL } from '@/utils/apiConfig';
import { ProtectedPage } from '@/components/ProtectedPage';
import { getClientDisplayName } from '@/utils/clientUtils';

const BRANCHES_URL = `${API_BASE_URL}/api/reference-data/branches`;
const VIREMENT_URL = `${API_BASE_URL}/api/epargne/virements`;
const BATCH_URL = `${API_BASE_URL}/api/epargne/virements/batch`;

interface VirementReport {
    id: number;
    referenceNumber: string;
    dateVirement: string;
    sourceClientName: string;
    destinationClientName: string;
    sourceAccountNumber: string;
    destinationAccountNumber: string;
    amount: number;
    commissionRate: number;
    commissionAmount: number;
    totalDebitAmount: number;
    motif: string;
    status: string;
    transferType: string;
    branchName: string;
    userAction: string;
}

interface BatchReport {
    id: number;
    batchNumber: string;
    dateVirement: string;
    sourceClientName: string;
    numberOfTransfers: number;
    totalAmount: number;
    totalDebitAmount: number;
    commissionAmount: number;
    commissionRate: number;
    motif: string;
    status: string;
    branchName: string;
    userAction: string;
}

const statusLabels: { [key: string]: string } = {
    PENDING: 'En attente',
    VALIDATED: 'Valid\u00e9',
    REJECTED: 'Rejet\u00e9',
    CANCELLED: 'Annul\u00e9'
};

const RapportVirementsPage = () => {
    const toast = useRef<Toast>(null);
    const branchesApi = useConsumApi('');
    const virementsApi = useConsumApi('');
    const batchApi = useConsumApi('');

    const [dateFrom, setDateFrom] = useState<Date | null>(null);
    const [dateTo, setDateTo] = useState<Date | null>(null);
    const [branchId, setBranchId] = useState<number | null>(null);
    const [status, setStatus] = useState<string | null>(null);
    const [branches, setBranches] = useState<any[]>([]);
    const [virementsData, setVirementsData] = useState<VirementReport[]>([]);
    const [batchData, setBatchData] = useState<BatchReport[]>([]);
    const [loading, setLoading] = useState(false);
    const [totals, setTotals] = useState({ totalVirements: 0, totalAmount: 0, totalCommissions: 0, totalBatches: 0, totalBatchAmount: 0 });

    const statusOptions = [
        { label: 'En attente', value: 'PENDING' },
        { label: 'Valid\u00e9', value: 'VALIDATED' },
        { label: 'Rejet\u00e9', value: 'REJECTED' },
        { label: 'Annul\u00e9', value: 'CANCELLED' }
    ];

    useEffect(() => { branchesApi.fetchData(null, 'GET', `${BRANCHES_URL}/findall`, 'loadBranches'); }, []);

    useEffect(() => {
        if (branchesApi.data) setBranches(Array.isArray(branchesApi.data) ? branchesApi.data : []);
    }, [branchesApi.data, branchesApi.error]);

    useEffect(() => {
        if (virementsApi.data) {
            const response = virementsApi.data;
            const dataArray = Array.isArray(response) ? response : (response.data || response.content || []);
            const mapped = dataArray.map((item: any) => ({
                ...item,
                sourceClientName: item.sourceClientName || getClientDisplayName(item.sourceClient),
                destinationClientName: item.destinationClientName || getClientDisplayName(item.destinationClient),
                branchName: item.branchName || item.branch?.name || '-'
            }));
            setVirementsData(mapped);
            const amount = mapped.reduce((s: number, i: any) => s + (i.amount || 0), 0);
            const commissions = mapped.reduce((s: number, i: any) => s + (i.commissionAmount || 0), 0);
            setTotals(prev => ({ ...prev, totalVirements: mapped.length, totalAmount: amount, totalCommissions: commissions }));
            setLoading(false);
            toast.current?.show({ severity: 'success', summary: 'Succ\u00e8s', detail: 'Rapport g\u00e9n\u00e9r\u00e9' });
        }
        if (virementsApi.error) { setLoading(false); toast.current?.show({ severity: 'error', summary: 'Erreur', detail: 'Erreur virements' }); }
    }, [virementsApi.data, virementsApi.error]);

    useEffect(() => {
        if (batchApi.data) {
            const response = batchApi.data;
            const dataArray = Array.isArray(response) ? response : (response.data || response.content || []);
            const mapped = dataArray.map((item: any) => ({
                ...item,
                sourceClientName: item.sourceClientName || getClientDisplayName(item.sourceClient),
                branchName: item.branchName || item.branch?.name || '-'
            }));
            setBatchData(mapped);
            const batchAmount = mapped.reduce((s: number, i: any) => s + (i.totalAmount || 0), 0);
            setTotals(prev => ({ ...prev, totalBatches: mapped.length, totalBatchAmount: batchAmount }));
        }
    }, [batchApi.data, batchApi.error]);

    const generateReport = () => {
        setLoading(true);
        const params = new URLSearchParams();
        if (dateFrom) params.append('dateFrom', dateFrom.toISOString().split('T')[0]);
        if (dateTo) params.append('dateTo', dateTo.toISOString().split('T')[0]);
        if (branchId) params.append('branchId', branchId.toString());
        if (status) params.append('status', status);
        virementsApi.fetchData(null, 'GET', `${VIREMENT_URL}/findall?${params.toString()}`, 'loadVirements');
        batchApi.fetchData(null, 'GET', `${BATCH_URL}/findall?${params.toString()}`, 'loadBatch');
    };

    const formatCurrency = (value: number) => new Intl.NumberFormat('fr-BI', { style: 'decimal' }).format(value) + ' FBU';

    const exportToPdf = () => {
        if (virementsData.length === 0 && batchData.length === 0) { toast.current?.show({ severity: 'warn', summary: 'Attention', detail: 'Aucune donn\u00e9e' }); return; }
        const title = 'Rapport des Virements';
        const dateRange = dateFrom && dateTo ? `Du ${dateFrom.toLocaleDateString('fr-FR')} au ${dateTo.toLocaleDateString('fr-FR')}` : 'Toutes les dates';
        const singleRows = virementsData.map(r => `<tr><td>${r.referenceNumber || '-'}</td><td>${r.dateVirement || '-'}</td><td>${r.sourceClientName}</td><td>${r.destinationClientName}</td><td style="text-align:right">${formatCurrency(r.amount || 0)}</td><td style="text-align:right">${formatCurrency(r.commissionAmount || 0)}</td><td style="text-align:right">${formatCurrency(r.totalDebitAmount || 0)}</td><td>${statusLabels[r.status] || r.status}</td></tr>`).join('');
        const batchRows = batchData.map(r => `<tr><td>${r.batchNumber || '-'}</td><td>${r.dateVirement || '-'}</td><td>${r.sourceClientName}</td><td>${r.numberOfTransfers || 0}</td><td style="text-align:right">${formatCurrency(r.totalAmount || 0)}</td><td style="text-align:right">${formatCurrency(r.commissionAmount || 0)}</td><td style="text-align:right">${formatCurrency(r.totalDebitAmount || 0)}</td><td>${statusLabels[r.status] || r.status}</td></tr>`).join('');
        const html = `<!DOCTYPE html><html><head><title>${title}</title><style>body{font-family:Arial,sans-serif;margin:20px}h2{color:#333;font-size:14px;margin-top:20px;border-bottom:2px solid #4a90a4;padding-bottom:4px}.header{display:flex;justify-content:space-between;align-items:center;border-bottom:3px double #333;padding-bottom:10px;margin-bottom:15px}.logo-section{display:flex;align-items:center;gap:12px}.company-name{margin:0;font-size:20px;font-weight:bold;color:#1e3a8a}.company-info{margin:2px 0 0;font-size:9px;color:#666}.doc-title{background:#1e40af;color:#fff;padding:6px 14px;border-radius:6px;font-size:13px;font-weight:600}.stats{display:flex;justify-content:space-around;margin-bottom:15px;padding:12px;background:#f5f5f5;border-radius:8px;flex-wrap:wrap}.stat-box{text-align:center;margin:4px}table{width:100%;border-collapse:collapse;font-size:9px;margin-top:10px}th,td{border:1px solid #ddd;padding:6px;text-align:left}th{background:#4a90a4;color:#fff}tr:nth-child(even){background:#f9f9f9}.footer{margin-top:20px;text-align:center;font-size:10px;color:#999}@media print{body{margin:0}}</style></head><body><div class="header"><div class="logo-section"><img src="/layout/images/logo/logoAgrinova.PNG" alt="Logo" style="height:60px;width:60px;object-fit:contain" /><div><h1 class="company-name">AgrM MICROFINANCE</h1><p class="company-info">Bujumbura, Burundi</p></div></div><div style="text-align:right"><div class="doc-title">${title}</div><p style="font-size:9px;color:#64748b;margin-top:4px">${dateRange}</p></div></div><div class="stats"><div class="stat-box"><strong>Virements:</strong> ${totals.totalVirements}</div><div class="stat-box"><strong>Montant:</strong> ${formatCurrency(totals.totalAmount)}</div><div class="stat-box"><strong>Commissions:</strong> ${formatCurrency(totals.totalCommissions)}</div><div class="stat-box"><strong>Lots:</strong> ${totals.totalBatches}</div></div>${virementsData.length > 0 ? `<h2>Virements Individuels</h2><table><thead><tr><th>R\u00e9f\u00e9rence</th><th>Date</th><th>Exp\u00e9diteur</th><th>B\u00e9n\u00e9ficiaire</th><th>Montant</th><th>Commission</th><th>Total D\u00e9bit</th><th>Statut</th></tr></thead><tbody>${singleRows}</tbody></table>` : ''}${batchData.length > 0 ? `<h2>Virements par Lot</h2><table><thead><tr><th>N\u00b0 Lot</th><th>Date</th><th>Exp\u00e9diteur</th><th>Transferts</th><th>Montant Total</th><th>Commission</th><th>Total D\u00e9bit</th><th>Statut</th></tr></thead><tbody>${batchRows}</tbody></table>` : ''}<p class="footer">G\u00e9n\u00e9r\u00e9 le ${new Date().toLocaleDateString('fr-FR')} \u00e0 ${new Date().toLocaleTimeString('fr-FR')}</p></body></html>`;
        const w = window.open('', '_blank');
        if (w) { w.document.write(html); w.document.close(); w.focus(); setTimeout(() => w.print(), 250); }
    };

    const exportToExcel = () => {
        if (virementsData.length === 0 && batchData.length === 0) { toast.current?.show({ severity: 'warn', summary: 'Attention', detail: 'Aucune donn\u00e9e' }); return; }
        let csv = '\uFEFF';
        if (virementsData.length > 0) {
            csv += 'VIREMENTS INDIVIDUELS\n' + ['R\u00e9f\u00e9rence', 'Date', 'Exp\u00e9diteur', 'B\u00e9n\u00e9ficiaire', 'Montant', 'Commission', 'Total D\u00e9bit', 'Motif', 'Statut', 'Cr\u00e9\u00e9 par'].join(';') + '\n';
            virementsData.forEach(r => { csv += [r.referenceNumber, r.dateVirement, r.sourceClientName, r.destinationClientName, r.amount, r.commissionAmount, r.totalDebitAmount, r.motif, statusLabels[r.status] || r.status, r.userAction].map(c => `"${c || ''}"`).join(';') + '\n'; });
            csv += '\n';
        }
        if (batchData.length > 0) {
            csv += 'VIREMENTS PAR LOT\n' + ['N\u00b0 Lot', 'Date', 'Exp\u00e9diteur', 'Transferts', 'Montant Total', 'Commission', 'Total D\u00e9bit', 'Motif', 'Statut', 'Cr\u00e9\u00e9 par'].join(';') + '\n';
            batchData.forEach(r => { csv += [r.batchNumber, r.dateVirement, r.sourceClientName, r.numberOfTransfers, r.totalAmount, r.commissionAmount, r.totalDebitAmount, r.motif, statusLabels[r.status] || r.status, r.userAction].map(c => `"${c || ''}"`).join(';') + '\n'; });
        }
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a'); link.href = URL.createObjectURL(blob); link.download = `rapport_virements_${new Date().toISOString().split('T')[0]}.csv`; link.click();
    };

    const statusTemplate = (row: any) => {
        const sev = (s: string) => { switch (s) { case 'VALIDATED': return 'success'; case 'PENDING': return 'warning'; default: return 'danger'; } };
        return <Tag value={statusLabels[row.status] || row.status} severity={sev(row.status)} />;
    };

    return (
        <div className="card">
            <Toast ref={toast} />
            <div className="flex align-items-center justify-content-between mb-4">
                <div className="flex align-items-center gap-2">
                    <i className="pi pi-send text-4xl text-primary"></i>
                    <div><h2 className="m-0">Rapport des Virements</h2><p className="m-0 text-500">Historique des virements individuels et par lot</p></div>
                </div>
                <div className="flex gap-2">
                    <Button label="PDF" icon="pi pi-file-pdf" severity="danger" onClick={exportToPdf} disabled={virementsData.length === 0 && batchData.length === 0} />
                    <Button label="Excel" icon="pi pi-file-excel" severity="success" onClick={exportToExcel} disabled={virementsData.length === 0 && batchData.length === 0} />
                </div>
            </div>
            <Divider />
            <Card className="mb-4">
                <h5 className="m-0 mb-3"><i className="pi pi-filter mr-2"></i>Crit\u00e8res de Recherche</h5>
                <div className="formgrid grid">
                    <div className="field col-12 md:col-3"><label>Date D\u00e9but</label><Calendar value={dateFrom} onChange={(e) => setDateFrom(e.value as Date)} dateFormat="dd/mm/yy" showIcon className="w-full" /></div>
                    <div className="field col-12 md:col-3"><label>Date Fin</label><Calendar value={dateTo} onChange={(e) => setDateTo(e.value as Date)} dateFormat="dd/mm/yy" showIcon className="w-full" /></div>
                    <div className="field col-12 md:col-3"><label>Agence</label><Dropdown value={branchId} options={branches} onChange={(e) => setBranchId(e.value)} optionLabel="name" optionValue="id" placeholder="Toutes" showClear className="w-full" /></div>
                    <div className="field col-12 md:col-3"><label>Statut</label><Dropdown value={status} options={statusOptions} onChange={(e) => setStatus(e.value)} placeholder="Tous" showClear className="w-full" /></div>
                </div>
                <div className="flex justify-content-end mt-3"><Button label="G\u00e9n\u00e9rer le Rapport" icon="pi pi-search" onClick={generateReport} loading={loading} /></div>
            </Card>
            {(virementsData.length > 0 || batchData.length > 0) && (
                <div className="grid mb-4">
                    <div className="col-12 md:col-3"><Card className="bg-blue-50"><div className="flex align-items-center gap-3"><i className="pi pi-send text-4xl text-blue-500"></i><div><p className="text-500 m-0">Virements</p><p className="text-2xl font-bold m-0">{totals.totalVirements}</p></div></div></Card></div>
                    <div className="col-12 md:col-3"><Card className="bg-green-50"><div className="flex align-items-center gap-3"><i className="pi pi-wallet text-4xl text-green-500"></i><div><p className="text-500 m-0">Montant Total</p><p className="text-2xl font-bold m-0">{formatCurrency(totals.totalAmount)}</p></div></div></Card></div>
                    <div className="col-12 md:col-3"><Card className="bg-orange-50"><div className="flex align-items-center gap-3"><i className="pi pi-money-bill text-4xl text-orange-500"></i><div><p className="text-500 m-0">Commissions</p><p className="text-2xl font-bold m-0">{formatCurrency(totals.totalCommissions)}</p></div></div></Card></div>
                    <div className="col-12 md:col-3"><Card className="bg-purple-50"><div className="flex align-items-center gap-3"><i className="pi pi-list text-4xl text-purple-500"></i><div><p className="text-500 m-0">Lots</p><p className="text-2xl font-bold m-0">{totals.totalBatches}</p></div></div></Card></div>
                </div>
            )}
            {loading ? <div className="flex justify-content-center p-5"><ProgressSpinner /></div> : (
                <TabView>
                    <TabPanel header="Virements Individuels" leftIcon="pi pi-send mr-2">
                        <DataTable value={virementsData} paginator rows={10} rowsPerPageOptions={[10, 25, 50]} emptyMessage="Aucune donn\u00e9e." className="p-datatable-sm" stripedRows>
                            <Column field="referenceNumber" header="R\u00e9f\u00e9rence" sortable />
                            <Column field="dateVirement" header="Date" sortable />
                            <Column field="sourceClientName" header="Exp\u00e9diteur" sortable />
                            <Column field="destinationClientName" header="B\u00e9n\u00e9ficiaire" sortable />
                            <Column field="amount" header="Montant" body={(r: any) => <span className="font-bold text-blue-600">{formatCurrency(r.amount || 0)}</span>} sortable />
                            <Column field="commissionAmount" header="Commission" body={(r: any) => <span className="font-bold text-orange-600">{formatCurrency(r.commissionAmount || 0)}</span>} sortable />
                            <Column field="totalDebitAmount" header="Total D\u00e9bit" body={(r: any) => <span className="font-bold text-green-600">{formatCurrency(r.totalDebitAmount || 0)}</span>} sortable />
                            <Column field="motif" header="Motif" sortable />
                            <Column field="status" header="Statut" body={statusTemplate} sortable />
                        </DataTable>
                    </TabPanel>
                    <TabPanel header="Virements par Lot" leftIcon="pi pi-list mr-2">
                        <DataTable value={batchData} paginator rows={10} rowsPerPageOptions={[10, 25, 50]} emptyMessage="Aucune donn\u00e9e." className="p-datatable-sm" stripedRows>
                            <Column field="batchNumber" header="N\u00b0 Lot" sortable />
                            <Column field="dateVirement" header="Date" sortable />
                            <Column field="sourceClientName" header="Exp\u00e9diteur" sortable />
                            <Column field="numberOfTransfers" header="Transferts" sortable />
                            <Column field="totalAmount" header="Montant Total" body={(r: any) => <span className="font-bold text-blue-600">{formatCurrency(r.totalAmount || 0)}</span>} sortable />
                            <Column field="commissionAmount" header="Commission" body={(r: any) => <span className="font-bold text-orange-600">{formatCurrency(r.commissionAmount || 0)}</span>} sortable />
                            <Column field="totalDebitAmount" header="Total D\u00e9bit" body={(r: any) => <span className="font-bold text-green-600">{formatCurrency(r.totalDebitAmount || 0)}</span>} sortable />
                            <Column field="motif" header="Motif" sortable />
                            <Column field="status" header="Statut" body={statusTemplate} sortable />
                        </DataTable>
                    </TabPanel>
                </TabView>
            )}
        </div>
    );
};

export default function ProtectedPageWrapper() {
    return <ProtectedPage requiredAuthorities={['EPARGNE_REPORT']}><RapportVirementsPage /></ProtectedPage>;
}
