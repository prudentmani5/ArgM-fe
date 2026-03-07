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
import { ProtectedPage } from '@/components/ProtectedPage';
import { getClientDisplayName } from '@/utils/clientUtils';

const BRANCHES_URL = `${API_BASE_URL}/api/reference-data/branches`;
const STATEMENT_URL = `${API_BASE_URL}/api/epargne/statement-requests`;

interface HistoryRequestReport {
    id: number;
    requestNumber: string;
    requestDate: string;
    requestType: string;
    clientName: string;
    clientNumber: string;
    accountNumber: string;
    branchName: string;
    periodStart: string;
    periodEnd: string;
    feeAmount: number;
    status: string;
    userAction: string;
    deliveredToName?: string;
}

const statusLabels: { [key: string]: string } = {
    PENDING: 'En attente',
    VALIDATED: 'Valid\u00e9',
    DELIVERED: 'Livr\u00e9',
    REJECTED: 'Rejet\u00e9',
    CANCELLED: 'Annul\u00e9'
};

const RapportDemandesHistoriquePage = () => {
    const toast = useRef<Toast>(null);
    const branchesApi = useConsumApi('');
    const reportApi = useConsumApi('');

    const [dateFrom, setDateFrom] = useState<Date | null>(null);
    const [dateTo, setDateTo] = useState<Date | null>(null);
    const [branchId, setBranchId] = useState<number | null>(null);
    const [status, setStatus] = useState<string | null>(null);
    const [branches, setBranches] = useState<any[]>([]);
    const [reportData, setReportData] = useState<HistoryRequestReport[]>([]);
    const [loading, setLoading] = useState(false);
    const [totals, setTotals] = useState({ totalRequests: 0, totalFees: 0, totalDelivered: 0 });

    const statusOptions = [
        { label: 'En attente', value: 'PENDING' },
        { label: 'Valid\u00e9', value: 'VALIDATED' },
        { label: 'Livr\u00e9', value: 'DELIVERED' },
        { label: 'Rejet\u00e9', value: 'REJECTED' },
        { label: 'Annul\u00e9', value: 'CANCELLED' }
    ];

    useEffect(() => { branchesApi.fetchData(null, 'GET', `${BRANCHES_URL}/findall`, 'loadBranches'); }, []);

    useEffect(() => {
        if (branchesApi.data) setBranches(Array.isArray(branchesApi.data) ? branchesApi.data : []);
        if (branchesApi.error) toast.current?.show({ severity: 'error', summary: 'Erreur', detail: 'Erreur chargement agences' });
    }, [branchesApi.data, branchesApi.error]);

    useEffect(() => {
        if (reportApi.data) {
            const response = reportApi.data;
            const dataArray = Array.isArray(response) ? response : (response.data || response.content || []);
            const filtered = dataArray.filter((i: any) => i.requestType === 'HISTORIQUE');
            const mapped = filtered.map((item: any) => ({
                ...item,
                clientName: item.clientName || getClientDisplayName(item.client),
                clientNumber: item.clientNumber || item.client?.clientNumber || '-',
                branchName: item.branchName || item.branch?.name || '-'
            }));
            setReportData(mapped);
            const fees = mapped.reduce((s: number, i: any) => s + (i.feeAmount || 0), 0);
            const delivered = mapped.filter((i: any) => i.status === 'DELIVERED').length;
            setTotals({ totalRequests: mapped.length, totalFees: fees, totalDelivered: delivered });
            toast.current?.show({ severity: 'success', summary: 'Succ\u00e8s', detail: 'Rapport g\u00e9n\u00e9r\u00e9' });
            setLoading(false);
        }
        if (reportApi.error) { toast.current?.show({ severity: 'error', summary: 'Erreur', detail: 'Erreur g\u00e9n\u00e9ration rapport' }); setLoading(false); }
    }, [reportApi.data, reportApi.error]);

    const generateReport = () => {
        setLoading(true);
        const params = new URLSearchParams();
        params.append('requestType', 'HISTORIQUE');
        if (dateFrom) params.append('dateFrom', dateFrom.toISOString().split('T')[0]);
        if (dateTo) params.append('dateTo', dateTo.toISOString().split('T')[0]);
        if (branchId) params.append('branchId', branchId.toString());
        if (status) params.append('status', status);
        reportApi.fetchData(null, 'GET', `${STATEMENT_URL}/findall?${params.toString()}`, 'generateReport');
    };

    const formatCurrency = (value: number) => new Intl.NumberFormat('fr-BI', { style: 'decimal' }).format(value) + ' FBU';

    const exportToPdf = () => {
        if (reportData.length === 0) { toast.current?.show({ severity: 'warn', summary: 'Attention', detail: 'Aucune donn\u00e9e' }); return; }
        const title = "Rapport des Demandes d'Historique";
        const dateRange = dateFrom && dateTo ? `Du ${dateFrom.toLocaleDateString('fr-FR')} au ${dateTo.toLocaleDateString('fr-FR')}` : 'Toutes les dates';
        const rows = reportData.map(r => `<tr><td>${r.requestNumber || '-'}</td><td>${r.requestDate || '-'}</td><td>${r.clientName}</td><td>${r.clientNumber || '-'}</td><td>${r.branchName}</td><td>${r.periodStart || '-'} - ${r.periodEnd || '-'}</td><td style="text-align:right">${formatCurrency(r.feeAmount || 0)}</td><td>${statusLabels[r.status] || r.status}</td><td>${r.userAction || '-'}</td></tr>`).join('');
        const html = `<!DOCTYPE html><html><head><title>${title}</title><style>body{font-family:Arial,sans-serif;margin:20px}.header{display:flex;justify-content:space-between;align-items:center;border-bottom:3px double #333;padding-bottom:10px;margin-bottom:15px}.logo-section{display:flex;align-items:center;gap:12px}.company-name{margin:0;font-size:20px;font-weight:bold;color:#1e3a8a}.company-info{margin:2px 0 0;font-size:9px;color:#666}.doc-title{background:#1e40af;color:#fff;padding:6px 14px;border-radius:6px;font-size:13px;font-weight:600}.stats{display:flex;justify-content:space-around;margin-bottom:15px;padding:12px;background:#f5f5f5;border-radius:8px}.stat-box{text-align:center}table{width:100%;border-collapse:collapse;font-size:9px}th,td{border:1px solid #ddd;padding:6px;text-align:left}th{background:#4a90a4;color:#fff}tr:nth-child(even){background:#f9f9f9}.footer{margin-top:20px;text-align:center;font-size:10px;color:#999}@media print{body{margin:0}}</style></head><body><div class="header"><div class="logo-section"><img src="/layout/images/logo/logoAgrinova.PNG" alt="Logo" style="height:60px;width:60px;object-fit:contain" /><div><h1 class="company-name">AgrM MICROFINANCE</h1><p class="company-info">Bujumbura, Burundi</p></div></div><div style="text-align:right"><div class="doc-title">${title}</div><p style="font-size:9px;color:#64748b;margin-top:4px">${dateRange}</p></div></div><div class="stats"><div class="stat-box"><strong>Demandes:</strong> ${totals.totalRequests}</div><div class="stat-box"><strong>Total Frais:</strong> ${formatCurrency(totals.totalFees)}</div><div class="stat-box"><strong>Livr\u00e9es:</strong> ${totals.totalDelivered}</div></div><table><thead><tr><th>N\u00b0 Demande</th><th>Date</th><th>Client</th><th>N\u00b0 Client</th><th>Agence</th><th>P\u00e9riode</th><th>Frais</th><th>Statut</th><th>Cr\u00e9\u00e9 par</th></tr></thead><tbody>${rows}</tbody></table><p class="footer">G\u00e9n\u00e9r\u00e9 le ${new Date().toLocaleDateString('fr-FR')} \u00e0 ${new Date().toLocaleTimeString('fr-FR')}</p></body></html>`;
        const w = window.open('', '_blank');
        if (w) { w.document.write(html); w.document.close(); w.focus(); setTimeout(() => w.print(), 250); }
    };

    const exportToExcel = () => {
        if (reportData.length === 0) { toast.current?.show({ severity: 'warn', summary: 'Attention', detail: 'Aucune donn\u00e9e' }); return; }
        let csv = '\uFEFF' + ['N\u00b0 Demande', 'Date', 'Client', 'N\u00b0 Client', 'Agence', 'P\u00e9riode D\u00e9but', 'P\u00e9riode Fin', 'Frais', 'Statut', 'Livr\u00e9 \u00e0', 'Cr\u00e9\u00e9 par'].join(';') + '\n';
        reportData.forEach(r => { csv += [r.requestNumber, r.requestDate, r.clientName, r.clientNumber, r.branchName, r.periodStart, r.periodEnd, r.feeAmount, statusLabels[r.status] || r.status, r.deliveredToName || '', r.userAction || ''].map(c => `"${c || ''}"`).join(';') + '\n'; });
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a'); link.href = URL.createObjectURL(blob); link.download = `rapport_demandes_historique_${new Date().toISOString().split('T')[0]}.csv`; link.click();
    };

    const statusTemplate = (row: HistoryRequestReport) => {
        const sev = (s: string) => { switch (s) { case 'DELIVERED': return 'success'; case 'VALIDATED': return 'info'; case 'PENDING': return 'warning'; default: return 'danger'; } };
        return <Tag value={statusLabels[row.status] || row.status} severity={sev(row.status)} />;
    };

    return (
        <div className="card">
            <Toast ref={toast} />
            <div className="flex align-items-center justify-content-between mb-4">
                <div className="flex align-items-center gap-2">
                    <i className="pi pi-history text-4xl text-primary"></i>
                    <div><h2 className="m-0">Rapport des Demandes d'Historique</h2><p className="m-0 text-500">Suivi des demandes d'historique de compte</p></div>
                </div>
                <div className="flex gap-2">
                    <Button label="PDF" icon="pi pi-file-pdf" severity="danger" onClick={exportToPdf} disabled={reportData.length === 0} />
                    <Button label="Excel" icon="pi pi-file-excel" severity="success" onClick={exportToExcel} disabled={reportData.length === 0} />
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
            {reportData.length > 0 && (
                <div className="grid mb-4">
                    <div className="col-12 md:col-4"><Card className="bg-blue-50"><div className="flex align-items-center gap-3"><i className="pi pi-hashtag text-4xl text-blue-500"></i><div><p className="text-500 m-0">Demandes</p><p className="text-2xl font-bold m-0">{totals.totalRequests}</p></div></div></Card></div>
                    <div className="col-12 md:col-4"><Card className="bg-green-50"><div className="flex align-items-center gap-3"><i className="pi pi-wallet text-4xl text-green-500"></i><div><p className="text-500 m-0">Total Frais</p><p className="text-2xl font-bold m-0">{formatCurrency(totals.totalFees)}</p></div></div></Card></div>
                    <div className="col-12 md:col-4"><Card className="bg-cyan-50"><div className="flex align-items-center gap-3"><i className="pi pi-check-circle text-4xl text-cyan-500"></i><div><p className="text-500 m-0">Livr\u00e9es</p><p className="text-2xl font-bold m-0">{totals.totalDelivered}</p></div></div></Card></div>
                </div>
            )}
            {loading ? <div className="flex justify-content-center p-5"><ProgressSpinner /></div> : (
                <DataTable value={reportData} paginator rows={10} rowsPerPageOptions={[10, 25, 50]} emptyMessage="Aucune donn\u00e9e. Veuillez g\u00e9n\u00e9rer un rapport." className="p-datatable-sm" stripedRows>
                    <Column field="requestNumber" header="N\u00b0 Demande" sortable />
                    <Column field="requestDate" header="Date" sortable />
                    <Column field="clientName" header="Client" sortable />
                    <Column field="clientNumber" header="N\u00b0 Client" sortable />
                    <Column field="branchName" header="Agence" sortable />
                    <Column header="P\u00e9riode" body={(r: any) => `${r.periodStart || '-'} - ${r.periodEnd || '-'}`} sortable />
                    <Column field="feeAmount" header="Frais" body={(r: any) => <span className="font-bold text-green-600">{formatCurrency(r.feeAmount || 0)}</span>} sortable />
                    <Column field="status" header="Statut" body={statusTemplate} sortable />
                    <Column field="userAction" header="Cr\u00e9\u00e9 par" sortable />
                </DataTable>
            )}
        </div>
    );
};

export default function ProtectedPageWrapper() {
    return <ProtectedPage requiredAuthorities={['EPARGNE_REPORT']}><RapportDemandesHistoriquePage /></ProtectedPage>;
}
