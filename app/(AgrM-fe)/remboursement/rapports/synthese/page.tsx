'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { Card } from 'primereact/card';
import { Chart } from 'primereact/chart';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Divider } from 'primereact/divider';
import { Tag } from 'primereact/tag';
import useConsumApi from '../../../../../hooks/fetchData/useConsumApi';
import { buildApiUrl } from '../../../../../utils/apiConfig';
import { exportToPDF, formatCurrency as formatCurrencyPDF, formatDate as formatDatePDF } from '../../../../../utils/pdfExport';

export default function SyntheseRemboursementPage() {
    const [stats, setStats] = useState({
        totalPayments: 0, totalCollected: 0,
        overdueCount: 0, overdueAmount: 0, avgDaysOverdue: 0,
        recoveryCount: 0, recoveryRecovered: 0, recoveryRate: 0,
        litigationCount: 0, litigationAmount: 0
    });
    const [classificationChart, setClassificationChart] = useState<any>({});
    const [statusChart, setStatusChart] = useState<any>({});
    const [topOverdue, setTopOverdue] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const toast = useRef<Toast>(null);

    const paymentsApi = useConsumApi('');
    const overdueApi = useConsumApi('');
    const recoveryApi = useConsumApi('');
    const legalApi = useConsumApi('');

    useEffect(() => {
        loadAllData();
    }, []);

    // Handle payments data
    useEffect(() => {
        if (paymentsApi.data) {
            const payments = Array.isArray(paymentsApi.data) ? paymentsApi.data : paymentsApi.data.content || [];
            const totalCollected = payments.reduce((sum: number, p: any) => sum + (p.amountReceived || 0), 0);
            setStats(prev => ({ ...prev, totalPayments: payments.length, totalCollected }));
        }
        if (paymentsApi.error) {
            toast.current?.show({ severity: 'error', summary: 'Erreur', detail: 'Erreur chargement paiements', life: 3000 });
        }
    }, [paymentsApi.data, paymentsApi.error]);

    // Handle overdue data
    useEffect(() => {
        if (overdueApi.data) {
            const overdue = Array.isArray(overdueApi.data) ? overdueApi.data : overdueApi.data.content || [];
            const overdueAmount = overdue.reduce((sum: number, r: any) => sum + (r.totalDue || 0) - (r.totalPaid || 0), 0);
            const avgDays = overdue.length > 0
                ? Math.round(overdue.reduce((sum: number, r: any) => sum + (r.daysOverdue || 0), 0) / overdue.length)
                : 0;

            setStats(prev => ({ ...prev, overdueCount: overdue.length, overdueAmount, avgDaysOverdue: avgDays }));

            // Top 10 overdue
            const sorted = [...overdue].sort((a, b) => (b.totalDue || 0) - (a.totalDue || 0)).slice(0, 10);
            setTopOverdue(sorted);

            // Classification chart
            const classCount = { normal: 0, watch: 0, doubtful: 0, litigation: 0 };
            overdue.forEach((r: any) => {
                const days = r.daysOverdue || 0;
                if (days > 90) classCount.litigation++;
                else if (days > 60) classCount.doubtful++;
                else if (days > 30) classCount.watch++;
                else classCount.normal++;
            });
            setClassificationChart({
                labels: ['Normal', 'A surveiller', 'Douteux', 'Contentieux'],
                datasets: [{
                    data: [classCount.normal, classCount.watch, classCount.doubtful, classCount.litigation],
                    backgroundColor: ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444']
                }]
            });
        }
    }, [overdueApi.data, overdueApi.error]);

    // Handle recovery data
    useEffect(() => {
        if (recoveryApi.data) {
            const recovery = Array.isArray(recoveryApi.data) ? recoveryApi.data : recoveryApi.data.content || [];
            const totalOverdue = recovery.reduce((sum: number, d: any) => sum + (d.totalOverdue || 0), 0);
            const totalRecovered = recovery.reduce((sum: number, d: any) => sum + (d.amountRecovered || 0), 0);
            const rate = totalOverdue > 0 ? Math.round((totalRecovered / totalOverdue) * 100) : 0;

            setStats(prev => ({ ...prev, recoveryCount: recovery.length, recoveryRecovered: totalRecovered, recoveryRate: rate }));

            // Status chart
            const statusCount: Record<string, number> = {};
            recovery.forEach((d: any) => {
                const s = d.status || 'UNKNOWN';
                statusCount[s] = (statusCount[s] || 0) + 1;
            });
            const labels: Record<string, string> = { 'ACTIVE': 'Actif', 'RESOLVED': 'Résolu', 'LITIGATION': 'Contentieux', 'CLOSED': 'Clôturé' };
            const colors: Record<string, string> = { 'ACTIVE': '#f59e0b', 'RESOLVED': '#22c55e', 'LITIGATION': '#ef4444', 'CLOSED': '#6b7280' };
            setStatusChart({
                labels: Object.keys(statusCount).map(k => labels[k] || k),
                datasets: [{
                    data: Object.values(statusCount),
                    backgroundColor: Object.keys(statusCount).map(k => colors[k] || '#3b82f6')
                }]
            });
        }
    }, [recoveryApi.data, recoveryApi.error]);

    // Handle legal data
    useEffect(() => {
        if (legalApi.data) {
            const legal = Array.isArray(legalApi.data) ? legalApi.data : legalApi.data.content || [];
            const litigationAmount = legal.reduce((sum: number, d: any) => sum + (d.amountAtTransfer || 0), 0);
            setStats(prev => ({ ...prev, litigationCount: legal.length, litigationAmount }));
        }
    }, [legalApi.data, legalApi.error]);

    useEffect(() => {
        setIsLoading(paymentsApi.loading || overdueApi.loading || recoveryApi.loading || legalApi.loading);
    }, [paymentsApi.loading, overdueApi.loading, recoveryApi.loading, legalApi.loading]);

    const loadAllData = () => {
        paymentsApi.fetchData(null, 'GET', buildApiUrl('/api/remboursement/payments/findall'), 'loadPayments');
        overdueApi.fetchData(null, 'GET', buildApiUrl('/api/remboursement/schedules/findoverdue'), 'loadOverdue');
        recoveryApi.fetchData(null, 'GET', buildApiUrl('/api/remboursement/recovery-cases/findall'), 'loadRecovery');
        legalApi.fetchData(null, 'GET', buildApiUrl('/api/remboursement/legal-cases/findall'), 'loadLegal');
    };

    const formatCurrency = (value: number) => {
        if (!value && value !== 0) return '-';
        return new Intl.NumberFormat('fr-FR', { style: 'decimal', minimumFractionDigits: 0 }).format(value) + ' BIF';
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('fr-FR');
    };

    const classificationBodyTemplate = (rowData: any) => {
        const days = rowData.daysOverdue || 0;
        let label = 'Normal';
        let severity: any = 'success';
        if (days > 90) { label = 'Contentieux'; severity = 'danger'; }
        else if (days > 60) { label = 'Douteux'; severity = 'warning'; }
        else if (days > 30) { label = 'A surveiller'; severity = 'info'; }
        return <Tag value={label} severity={severity} />;
    };

    const chartOptions = {
        plugins: { legend: { position: 'bottom' as const } },
        responsive: true,
        maintainAspectRatio: false
    };

    const exportPdf = () => {
        exportToPDF({
            title: 'Synthese Remboursement',
            columns: [
                { header: 'N° Crédit', dataKey: 'loanId' },
                { header: 'Date Échéance', dataKey: 'dueDate', formatter: formatDatePDF },
                { header: 'Montant Dû', dataKey: 'totalDue', formatter: formatCurrencyPDF },
                { header: 'Jours Retard', dataKey: 'daysOverdue' }
            ],
            data: topOverdue,
            filename: 'synthese_remboursement.pdf',
            orientation: 'landscape',
            statistics: [
                { label: 'Total Paiements', value: stats.totalPayments },
                { label: 'Montant Collecté', value: formatCurrency(stats.totalCollected) },
                { label: 'Crédits en Retard', value: stats.overdueCount },
                { label: 'Taux de Recouvrement', value: `${stats.recoveryRate}%` },
                { label: 'Dossiers Contentieux', value: stats.litigationCount },
                { label: 'Montant Contentieux', value: formatCurrency(stats.litigationAmount) }
            ]
        });
    };

    return (
        <div className="card">
            <Toast ref={toast} />

            <div className="flex flex-wrap align-items-center justify-content-between mb-4">
                <h2 className="m-0">
                    <i className="pi pi-chart-pie mr-2"></i>
                    Synthese Remboursement
                </h2>
                <div className="flex gap-2">
                    <Button label="Actualiser" icon="pi pi-refresh" onClick={loadAllData} loading={isLoading} />
                    <Button label="Exporter PDF" icon="pi pi-file-pdf" severity="danger" onClick={exportPdf} />
                </div>
            </div>

            {/* Key Performance Indicators */}
            <div className="grid mb-4">
                <div className="col-12 md:col-3">
                    <Card className="bg-blue-100 h-full">
                        <div className="text-center">
                            <i className="pi pi-wallet text-4xl text-blue-500 mb-2"></i>
                            <div className="text-2xl font-bold text-blue-700">{stats.totalPayments}</div>
                            <div className="text-500">Paiements Enregistrés</div>
                        </div>
                    </Card>
                </div>
                <div className="col-12 md:col-3">
                    <Card className="bg-green-100 h-full">
                        <div className="text-center">
                            <i className="pi pi-check-circle text-4xl text-green-500 mb-2"></i>
                            <div className="text-2xl font-bold text-green-700">{formatCurrency(stats.totalCollected)}</div>
                            <div className="text-500">Montant Collecté</div>
                        </div>
                    </Card>
                </div>
                <div className="col-12 md:col-3">
                    <Card className="bg-orange-100 h-full">
                        <div className="text-center">
                            <i className="pi pi-exclamation-triangle text-4xl text-orange-500 mb-2"></i>
                            <div className="text-2xl font-bold text-orange-700">{stats.overdueCount}</div>
                            <div className="text-500">Crédits en Retard</div>
                            <div className="text-sm text-500">{formatCurrency(stats.overdueAmount)}</div>
                        </div>
                    </Card>
                </div>
                <div className="col-12 md:col-3">
                    <Card className="bg-purple-100 h-full">
                        <div className="text-center">
                            <i className="pi pi-percentage text-4xl text-purple-500 mb-2"></i>
                            <div className="text-2xl font-bold text-purple-700">{stats.recoveryRate}%</div>
                            <div className="text-500">Taux de Recouvrement</div>
                        </div>
                    </Card>
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid mb-4">
                <div className="col-12 md:col-6">
                    <Card title="Classification des Retards" className="h-full">
                        <div style={{ height: '300px' }}>
                            <Chart type="doughnut" data={classificationChart} options={chartOptions} style={{ height: '100%' }} />
                        </div>
                    </Card>
                </div>
                <div className="col-12 md:col-6">
                    <Card title="Statut des Dossiers Recouvrement" className="h-full">
                        <div style={{ height: '300px' }}>
                            <Chart type="pie" data={statusChart} options={chartOptions} style={{ height: '100%' }} />
                        </div>
                    </Card>
                </div>
            </div>

            {/* Secondary Stats */}
            <div className="grid mb-4">
                <div className="col-12 md:col-4">
                    <Card className="bg-red-50">
                        <div className="text-center">
                            <div className="text-500 mb-1">Dossiers Contentieux</div>
                            <div className="text-2xl font-bold text-red-700">{stats.litigationCount}</div>
                            <div className="text-sm text-500">{formatCurrency(stats.litigationAmount)}</div>
                        </div>
                    </Card>
                </div>
                <div className="col-12 md:col-4">
                    <Card className="bg-cyan-50">
                        <div className="text-center">
                            <div className="text-500 mb-1">Dossiers Recouvrement</div>
                            <div className="text-2xl font-bold text-cyan-700">{stats.recoveryCount}</div>
                            <div className="text-sm text-500">{formatCurrency(stats.recoveryRecovered)} recouvré</div>
                        </div>
                    </Card>
                </div>
                <div className="col-12 md:col-4">
                    <Card className="bg-indigo-50">
                        <div className="text-center">
                            <div className="text-500 mb-1">Retard Moyen</div>
                            <div className="text-2xl font-bold text-indigo-700">{stats.avgDaysOverdue} jours</div>
                        </div>
                    </Card>
                </div>
            </div>

            {/* Top Overdue */}
            <Card title="Top 10 - Échéances avec les Plus Gros Impayés" className="mb-4">
                <DataTable
                    value={topOverdue}
                    loading={isLoading}
                    emptyMessage="Aucune donnée disponible."
                    stripedRows
                    rows={10}
                    className="p-datatable-sm"
                >
                    <Column field="loanId" header="N° Crédit" sortable />
                    <Column field="dueDate" header="Date Échéance" body={(row) => formatDate(row.dueDate)} sortable />
                    <Column field="totalDue" header="Montant Dû" body={(row) => formatCurrency(row.totalDue)} sortable />
                    <Column field="totalPaid" header="Montant Payé" body={(row) => formatCurrency(row.totalPaid)} />
                    <Column field="daysOverdue" header="Jours Retard" body={(row) => <Tag value={`${row.daysOverdue} jours`} severity={row.daysOverdue > 90 ? 'danger' : row.daysOverdue > 30 ? 'warning' : 'info'} />} sortable />
                    <Column header="Classification" body={classificationBodyTemplate} />
                </DataTable>
            </Card>

            <Divider />

            <div className="text-center text-500">
                <i className="pi pi-info-circle mr-2"></i>
                Les données sont calculées en temps réel a partir de la base de données.
            </div>
        </div>
    );
}
