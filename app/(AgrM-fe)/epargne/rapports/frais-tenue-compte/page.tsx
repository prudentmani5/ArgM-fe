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
import { Dialog } from 'primereact/dialog';
import useConsumApi from '@/hooks/fetchData/useConsumApi';
import { API_BASE_URL } from '@/utils/apiConfig';
import { ProtectedPage } from '@/components/ProtectedPage';

const FTC_URL = `${API_BASE_URL}/api/epargne/frais-tenue-compte`;

interface FtcExecution {
    id: number;
    batchNumber: string;
    executionDate: string;
    periodStart: string;
    periodEnd: string;
    frequency: string;
    accountType: string;
    feeAmount: number;
    totalAccountsProcessed: number;
    totalAccountsSkipped: number;
    totalAmountCollected: number;
    status: string;
    errorMessage?: string;
    executedBy: string;
    createdAt: string;
}

interface FtcDetail {
    id: number;
    accountNumber: string;
    clientName: string;
    amount: number;
    balanceBefore: number;
    balanceAfter: number;
    status: string;
    skipReason?: string;
    pieceId?: string;
}

const frequencyLabels: { [key: string]: string } = { MONTHLY: 'Mensuel', QUARTERLY: 'Trimestriel', SEMI_ANNUAL: 'Semestriel', ANNUAL: 'Annuel' };
const accountTypeLabels: { [key: string]: string } = { REGULAR: 'Ordinaire', TERM_DEPOSIT: 'D\u00e9p\u00f4t \u00e0 Terme', COMPULSORY: '\u00c9pargne Obligatoire' };

const RapportFraisTenueComptePage = () => {
    const toast = useRef<Toast>(null);
    const executionsApi = useConsumApi('');
    const detailsApi = useConsumApi('');

    const [dateFrom, setDateFrom] = useState<Date | null>(null);
    const [dateTo, setDateTo] = useState<Date | null>(null);
    const [statusFilter, setStatusFilter] = useState<string | null>(null);
    const [executionData, setExecutionData] = useState<FtcExecution[]>([]);
    const [detailData, setDetailData] = useState<FtcDetail[]>([]);
    const [selectedExecution, setSelectedExecution] = useState<FtcExecution | null>(null);
    const [showDetails, setShowDetails] = useState(false);
    const [loading, setLoading] = useState(false);
    const [totals, setTotals] = useState({ totalExecutions: 0, totalCollected: 0, totalAccounts: 0 });

    const statusOptions = [
        { label: 'Termin\u00e9', value: 'COMPLETED' },
        { label: '\u00c9chou\u00e9', value: 'FAILED' },
        { label: 'En cours', value: 'IN_PROGRESS' }
    ];

    useEffect(() => {
        if (executionsApi.data) {
            const response = executionsApi.data;
            const dataArray = Array.isArray(response) ? response : (response.data || response.content || []);
            setExecutionData(dataArray);
            const collected = dataArray.reduce((s: number, i: any) => s + (i.totalAmountCollected || 0), 0);
            const accounts = dataArray.reduce((s: number, i: any) => s + (i.totalAccountsProcessed || 0), 0);
            setTotals({ totalExecutions: dataArray.length, totalCollected: collected, totalAccounts: accounts });
            toast.current?.show({ severity: 'success', summary: 'Succ\u00e8s', detail: 'Rapport g\u00e9n\u00e9r\u00e9' });
            setLoading(false);
        }
        if (executionsApi.error) { toast.current?.show({ severity: 'error', summary: 'Erreur', detail: 'Erreur g\u00e9n\u00e9ration rapport' }); setLoading(false); }
    }, [executionsApi.data, executionsApi.error]);

    useEffect(() => {
        if (detailsApi.data) {
            const response = detailsApi.data;
            setDetailData(Array.isArray(response) ? response : (response.data || response.content || []));
        }
    }, [detailsApi.data, detailsApi.error]);

    const generateReport = () => {
        setLoading(true);
        const params = new URLSearchParams();
        if (dateFrom) params.append('dateFrom', dateFrom.toISOString().split('T')[0]);
        if (dateTo) params.append('dateTo', dateTo.toISOString().split('T')[0]);
        if (statusFilter) params.append('status', statusFilter);
        executionsApi.fetchData(null, 'GET', `${FTC_URL}/executions/findall?${params.toString()}`, 'generateReport');
    };

    const viewDetails = (execution: FtcExecution) => {
        setSelectedExecution(execution);
        setShowDetails(true);
        detailsApi.fetchData(null, 'GET', `${FTC_URL}/executions/${execution.id}/details`, 'loadDetails');
    };

    const formatCurrency = (value: number) => new Intl.NumberFormat('fr-BI', { style: 'decimal' }).format(value) + ' FBU';

    const exportToPdf = () => {
        if (executionData.length === 0) { toast.current?.show({ severity: 'warn', summary: 'Attention', detail: 'Aucune donn\u00e9e' }); return; }
        const title = 'Rapport des Frais de Tenue de Compte';
        const dateRange = dateFrom && dateTo ? `Du ${dateFrom.toLocaleDateString('fr-FR')} au ${dateTo.toLocaleDateString('fr-FR')}` : 'Toutes les dates';
        const rows = executionData.map(r => `<tr><td>${r.batchNumber || '-'}</td><td>${r.executionDate || '-'}</td><td>${accountTypeLabels[r.accountType] || r.accountType || '-'}</td><td>${frequencyLabels[r.frequency] || r.frequency || '-'}</td><td style="text-align:right">${formatCurrency(r.feeAmount || 0)}</td><td>${r.totalAccountsProcessed || 0}</td><td>${r.totalAccountsSkipped || 0}</td><td style="text-align:right">${formatCurrency(r.totalAmountCollected || 0)}</td><td>${r.status === 'COMPLETED' ? 'Termin\u00e9' : r.status === 'FAILED' ? '\u00c9chou\u00e9' : 'En cours'}</td><td>${r.executedBy || '-'}</td></tr>`).join('');
        const html = `<!DOCTYPE html><html><head><title>${title}</title><style>body{font-family:Arial,sans-serif;margin:20px}.header{display:flex;justify-content:space-between;align-items:center;border-bottom:3px double #333;padding-bottom:10px;margin-bottom:15px}.logo-section{display:flex;align-items:center;gap:12px}.company-name{margin:0;font-size:20px;font-weight:bold;color:#1e3a8a}.company-info{margin:2px 0 0;font-size:9px;color:#666}.doc-title{background:#1e40af;color:#fff;padding:6px 14px;border-radius:6px;font-size:13px;font-weight:600}.stats{display:flex;justify-content:space-around;margin-bottom:15px;padding:12px;background:#f5f5f5;border-radius:8px}.stat-box{text-align:center}table{width:100%;border-collapse:collapse;font-size:9px}th,td{border:1px solid #ddd;padding:6px;text-align:left}th{background:#4a90a4;color:#fff}tr:nth-child(even){background:#f9f9f9}.footer{margin-top:20px;text-align:center;font-size:10px;color:#999}@media print{body{margin:0}}</style></head><body><div class="header"><div class="logo-section"><img src="/layout/images/logo/logoAgrinova.PNG" alt="Logo" style="height:60px;width:60px;object-fit:contain" /><div><h1 class="company-name">AgrM MICROFINANCE</h1><p class="company-info">Bujumbura, Burundi</p></div></div><div style="text-align:right"><div class="doc-title">${title}</div><p style="font-size:9px;color:#64748b;margin-top:4px">${dateRange}</p></div></div><div class="stats"><div class="stat-box"><strong>Ex\u00e9cutions:</strong> ${totals.totalExecutions}</div><div class="stat-box"><strong>Comptes Trait\u00e9s:</strong> ${totals.totalAccounts}</div><div class="stat-box"><strong>Total Collect\u00e9:</strong> ${formatCurrency(totals.totalCollected)}</div></div><table><thead><tr><th>N\u00b0 Batch</th><th>Date</th><th>Type Compte</th><th>Fr\u00e9quence</th><th>Frais/Compte</th><th>Comptes Trait\u00e9s</th><th>Ignor\u00e9s</th><th>Montant Collect\u00e9</th><th>Statut</th><th>Ex\u00e9cut\u00e9 par</th></tr></thead><tbody>${rows}</tbody></table><p class="footer">G\u00e9n\u00e9r\u00e9 le ${new Date().toLocaleDateString('fr-FR')} \u00e0 ${new Date().toLocaleTimeString('fr-FR')}</p></body></html>`;
        const w = window.open('', '_blank');
        if (w) { w.document.write(html); w.document.close(); w.focus(); setTimeout(() => w.print(), 250); }
    };

    const exportToExcel = () => {
        if (executionData.length === 0) { toast.current?.show({ severity: 'warn', summary: 'Attention', detail: 'Aucune donn\u00e9e' }); return; }
        let csv = '\uFEFF' + ['N\u00b0 Batch', 'Date', 'P\u00e9riode D\u00e9but', 'P\u00e9riode Fin', 'Type Compte', 'Fr\u00e9quence', 'Frais/Compte', 'Comptes Trait\u00e9s', 'Comptes Ignor\u00e9s', 'Montant Collect\u00e9', 'Statut', 'Ex\u00e9cut\u00e9 par'].join(';') + '\n';
        executionData.forEach(r => { csv += [r.batchNumber, r.executionDate, r.periodStart, r.periodEnd, accountTypeLabels[r.accountType] || r.accountType, frequencyLabels[r.frequency] || r.frequency, r.feeAmount, r.totalAccountsProcessed, r.totalAccountsSkipped, r.totalAmountCollected, r.status, r.executedBy].map(c => `"${c || ''}"`).join(';') + '\n'; });
        csv += `\n"Total";"${totals.totalExecutions}";;;;"Comptes";"${totals.totalAccounts}";;"Collect\u00e9";"${totals.totalCollected}";\n`;
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a'); link.href = URL.createObjectURL(blob); link.download = `rapport_ftc_${new Date().toISOString().split('T')[0]}.csv`; link.click();
    };

    const statusTemplate = (row: FtcExecution) => {
        const sev = row.status === 'COMPLETED' ? 'success' : row.status === 'FAILED' ? 'danger' : 'warning';
        const label = row.status === 'COMPLETED' ? 'Termin\u00e9' : row.status === 'FAILED' ? '\u00c9chou\u00e9' : 'En cours';
        return <Tag value={label} severity={sev} />;
    };

    return (
        <div className="card">
            <Toast ref={toast} />
            <div className="flex align-items-center justify-content-between mb-4">
                <div className="flex align-items-center gap-2">
                    <i className="pi pi-cog text-4xl text-primary"></i>
                    <div><h2 className="m-0">Rapport des Frais de Tenue de Compte</h2><p className="m-0 text-500">Historique des ex\u00e9cutions de frais</p></div>
                </div>
                <div className="flex gap-2">
                    <Button label="PDF" icon="pi pi-file-pdf" severity="danger" onClick={exportToPdf} disabled={executionData.length === 0} />
                    <Button label="Excel" icon="pi pi-file-excel" severity="success" onClick={exportToExcel} disabled={executionData.length === 0} />
                </div>
            </div>
            <Divider />
            <Card className="mb-4">
                <h5 className="m-0 mb-3"><i className="pi pi-filter mr-2"></i>Crit\u00e8res de Recherche</h5>
                <div className="formgrid grid">
                    <div className="field col-12 md:col-4"><label>Date D\u00e9but</label><Calendar value={dateFrom} onChange={(e) => setDateFrom(e.value as Date)} dateFormat="dd/mm/yy" showIcon className="w-full" /></div>
                    <div className="field col-12 md:col-4"><label>Date Fin</label><Calendar value={dateTo} onChange={(e) => setDateTo(e.value as Date)} dateFormat="dd/mm/yy" showIcon className="w-full" /></div>
                    <div className="field col-12 md:col-4"><label>Statut</label><Dropdown value={statusFilter} options={statusOptions} onChange={(e) => setStatusFilter(e.value)} placeholder="Tous" showClear className="w-full" /></div>
                </div>
                <div className="flex justify-content-end mt-3"><Button label="G\u00e9n\u00e9rer le Rapport" icon="pi pi-search" onClick={generateReport} loading={loading} /></div>
            </Card>
            {executionData.length > 0 && (
                <div className="grid mb-4">
                    <div className="col-12 md:col-4"><Card className="bg-blue-50"><div className="flex align-items-center gap-3"><i className="pi pi-replay text-4xl text-blue-500"></i><div><p className="text-500 m-0">Ex\u00e9cutions</p><p className="text-2xl font-bold m-0">{totals.totalExecutions}</p></div></div></Card></div>
                    <div className="col-12 md:col-4"><Card className="bg-green-50"><div className="flex align-items-center gap-3"><i className="pi pi-users text-4xl text-green-500"></i><div><p className="text-500 m-0">Comptes Trait\u00e9s</p><p className="text-2xl font-bold m-0">{totals.totalAccounts}</p></div></div></Card></div>
                    <div className="col-12 md:col-4"><Card className="bg-purple-50"><div className="flex align-items-center gap-3"><i className="pi pi-wallet text-4xl text-purple-500"></i><div><p className="text-500 m-0">Total Collect\u00e9</p><p className="text-2xl font-bold m-0">{formatCurrency(totals.totalCollected)}</p></div></div></Card></div>
                </div>
            )}
            {loading ? <div className="flex justify-content-center p-5"><ProgressSpinner /></div> : (
                <DataTable value={executionData} paginator rows={10} rowsPerPageOptions={[10, 25, 50]} emptyMessage="Aucune donn\u00e9e. Veuillez g\u00e9n\u00e9rer un rapport." className="p-datatable-sm" stripedRows>
                    <Column field="batchNumber" header="N\u00b0 Batch" sortable />
                    <Column field="executionDate" header="Date" sortable />
                    <Column field="accountType" header="Type Compte" body={(r: any) => accountTypeLabels[r.accountType] || r.accountType} sortable />
                    <Column field="frequency" header="Fr\u00e9quence" body={(r: any) => frequencyLabels[r.frequency] || r.frequency} sortable />
                    <Column field="feeAmount" header="Frais/Compte" body={(r: any) => <span className="font-bold">{formatCurrency(r.feeAmount || 0)}</span>} sortable />
                    <Column field="totalAccountsProcessed" header="Trait\u00e9s" sortable />
                    <Column field="totalAccountsSkipped" header="Ignor\u00e9s" sortable />
                    <Column field="totalAmountCollected" header="Montant Collect\u00e9" body={(r: any) => <span className="font-bold text-green-600">{formatCurrency(r.totalAmountCollected || 0)}</span>} sortable />
                    <Column field="status" header="Statut" body={statusTemplate} sortable />
                    <Column field="executedBy" header="Ex\u00e9cut\u00e9 par" sortable />
                    <Column header="D\u00e9tails" body={(r: FtcExecution) => <Button icon="pi pi-eye" severity="info" text onClick={() => viewDetails(r)} />} />
                </DataTable>
            )}
            <Dialog header={`D\u00e9tails - ${selectedExecution?.batchNumber || ''}`} visible={showDetails} style={{ width: '80vw' }} onHide={() => setShowDetails(false)}>
                {selectedExecution && (
                    <div className="mb-3">
                        <div className="grid">
                            <div className="col-4"><strong>Date:</strong> {selectedExecution.executionDate}</div>
                            <div className="col-4"><strong>P\u00e9riode:</strong> {selectedExecution.periodStart} - {selectedExecution.periodEnd}</div>
                            <div className="col-4"><strong>Montant total:</strong> <span className="text-green-600 font-bold">{formatCurrency(selectedExecution.totalAmountCollected)}</span></div>
                        </div>
                    </div>
                )}
                <DataTable value={detailData} paginator rows={15} rowsPerPageOptions={[15, 30, 50]} emptyMessage="Chargement..." className="p-datatable-sm" stripedRows>
                    <Column field="accountNumber" header="N\u00b0 Compte" sortable />
                    <Column field="clientName" header="Client" sortable />
                    <Column field="amount" header="Montant" body={(r: any) => <span className="font-bold">{formatCurrency(r.amount || 0)}</span>} sortable />
                    <Column field="balanceBefore" header="Solde Avant" body={(r: any) => formatCurrency(r.balanceBefore || 0)} sortable />
                    <Column field="balanceAfter" header="Solde Apr\u00e8s" body={(r: any) => <span className={r.balanceAfter < 0 ? 'text-red-600 font-bold' : ''}>{formatCurrency(r.balanceAfter || 0)}</span>} sortable />
                    <Column field="status" header="Statut" body={(r: any) => <Tag value={r.status === 'SUCCESS' ? 'Succ\u00e8s' : r.status === 'SKIPPED' ? 'Ignor\u00e9' : r.status} severity={r.status === 'SUCCESS' ? 'success' : 'warning'} />} sortable />
                    <Column field="skipReason" header="Raison" sortable />
                </DataTable>
            </Dialog>
        </div>
    );
};

export default function ProtectedPageWrapper() {
    return <ProtectedPage requiredAuthorities={['EPARGNE_REPORT']}><RapportFraisTenueComptePage /></ProtectedPage>;
}
