'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Toast } from 'primereact/toast';
import { Card } from 'primereact/card';
import { Chart } from 'primereact/chart';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Divider } from 'primereact/divider';
import { Tag } from 'primereact/tag';
import useConsumApi from '../../../../hooks/fetchData/useConsumApi';
import { API_BASE_URL } from '../../../../utils/apiConfig';
import { ProtectedPage } from '@/components/ProtectedPage';
import KpiCard from '../components/KpiCard';
import DashboardFilters from '../components/DashboardFilters';
import { formatBIF, formatPercent, formatCompact, formatNumber } from '../components/CurrencyFormatter';

const DASHBOARD_URL = `${API_BASE_URL}/api/dashboard/credit-ops`;
const BRANCHES_URL = `${API_BASE_URL}/api/dashboard`;

interface CreditOpsDashboard {
    applicationsReceived: number;
    applicationsInAnalysis: number;
    applicationsInCommittee: number;
    applicationsApproved: number;
    applicationsRejected: number;
    avgProcessingDays: number;
    totalAmountRequested: number;
    totalAmountApproved: number;
    encoursBrut: number;
    encoursNet: number;
    par1: number;
    par30: number;
    par90: number;
    defaultRate: number;
    provisionAmount: number;
    activeLoansCount: number;
    overdueAmount: number;
    overdueClientsCount: number;
    restructuredLoansCount: number;
    restructuredAmount: number;
    litigationCount: number;
    recoveryRate: number;
    pipelineStages: { stage: string; label: string; count: number; amount: number }[];
    parByBranch: { branchId: number; branchName: string; loanOutstanding: number; par30: number }[];
    topDebtors: { clientName: string; applicationNumber: string; loanId: number; overdueAmount: number; daysOverdue: number; branchName: string }[];
}

const CreditOpsDashboardPage = () => {
    const toast = useRef<Toast>(null);
    const dashApi = useConsumApi('');
    const branchApi = useConsumApi('');

    const [data, setData] = useState<CreditOpsDashboard | null>(null);
    const [branches, setBranches] = useState<any[]>([]);
    const [startDate, setStartDate] = useState<Date | null>(new Date(new Date().getFullYear(), new Date().getMonth() - 11, 1));
    const [endDate, setEndDate] = useState<Date | null>(new Date());
    const [branchId, setBranchId] = useState<number | null>(null);

    useEffect(() => {
        branchApi.fetchData(null, 'GET', `${BRANCHES_URL}/branches`, 'loadBranches');
        loadDashboard();
    }, []);

    useEffect(() => {
        if (branchApi.data && branchApi.callType === 'loadBranches') {
            setBranches(Array.isArray(branchApi.data) ? branchApi.data : []);
        }
    }, [branchApi.data]);

    useEffect(() => {
        if (dashApi.data && dashApi.callType === 'loadDashboard') {
            setData(dashApi.data as CreditOpsDashboard);
        }
        if (dashApi.error) {
            toast.current?.show({ severity: 'error', summary: 'Erreur', detail: dashApi.error.message });
        }
    }, [dashApi.data, dashApi.error]);

    const loadDashboard = () => {
        const params = new URLSearchParams();
        if (startDate) params.append('startDate', startDate.toISOString().split('T')[0]);
        if (endDate) params.append('endDate', endDate.toISOString().split('T')[0]);
        if (branchId) params.append('branchId', branchId.toString());
        dashApi.fetchData(null, 'GET', `${DASHBOARD_URL}?${params.toString()}`, 'loadDashboard');
    };

    const pipelineChart = data?.pipelineStages ? {
        labels: data.pipelineStages.map(s => s.label),
        datasets: [{
            label: 'Nombre de demandes',
            backgroundColor: ['#3b82f6', '#f97316', '#a855f7', '#22c55e', '#ef4444'],
            data: data.pipelineStages.map(s => s.count),
            indexAxis: 'y' as const
        }]
    } : null;

    const parByBranchChart = data?.parByBranch ? {
        labels: data.parByBranch.map(b => b.branchName),
        datasets: [
            { label: 'Encours (M)', backgroundColor: '#3b82f6', data: data.parByBranch.map(b => (b.loanOutstanding || 0) / 1_000_000) },
            { label: 'PAR > 30j (%)', backgroundColor: '#ef4444', data: data.parByBranch.map(b => b.par30 || 0), yAxisID: 'y1' }
        ]
    } : null;

    return (
        <div className="card">
            <Toast ref={toast} />

            <div className="flex align-items-center gap-2 mb-3">
                <i className="pi pi-briefcase text-4xl text-primary"></i>
                <div>
                    <h2 className="m-0">Tableau de Bord - Opérations Crédit</h2>
                    <p className="m-0 text-500">Suivi du portefeuille et pipeline des demandes</p>
                </div>
            </div>

            <DashboardFilters startDate={startDate} endDate={endDate} branchId={branchId}
                branches={branches} onStartDateChange={setStartDate} onEndDateChange={setEndDate}
                onBranchChange={setBranchId} onApply={loadDashboard} loading={dashApi.loading} />

            {dashApi.loading ? (
                <div className="flex justify-content-center p-5"><ProgressSpinner /></div>
            ) : data ? (
                <>
                    {/* Section A: Pipeline */}
                    <h4 className="text-primary mb-3"><i className="pi pi-filter mr-2"></i>Pipeline des Demandes</h4>
                    <div className="grid mb-4">
                        <div className="col-12 md:col-6 lg:col-2">
                            <KpiCard label="Reçues" value={formatNumber(data.applicationsReceived)} icon="pi pi-inbox" color="#3b82f6" />
                        </div>
                        <div className="col-12 md:col-6 lg:col-2">
                            <KpiCard label="En analyse" value={formatNumber(data.applicationsInAnalysis)} icon="pi pi-search" color="#f97316" />
                        </div>
                        <div className="col-12 md:col-6 lg:col-2">
                            <KpiCard label="En comité" value={formatNumber(data.applicationsInCommittee)} icon="pi pi-users" color="#a855f7" />
                        </div>
                        <div className="col-12 md:col-6 lg:col-2">
                            <KpiCard label="Approuvées" value={formatNumber(data.applicationsApproved)} icon="pi pi-check-circle" color="#22c55e" />
                        </div>
                        <div className="col-12 md:col-6 lg:col-2">
                            <KpiCard label="Rejetées" value={formatNumber(data.applicationsRejected)} icon="pi pi-times-circle" color="#ef4444" />
                        </div>
                        <div className="col-12 md:col-6 lg:col-2">
                            <KpiCard label="Délai moyen (j)" value={formatNumber(data.avgProcessingDays)} icon="pi pi-clock" color="#6366f1" />
                        </div>
                    </div>
                    <div className="grid mb-4">
                        <div className="col-12 md:col-6">
                            <KpiCard label="Montant total demandé" value={formatCompact(data.totalAmountRequested)} icon="pi pi-money-bill" color="#3b82f6" />
                        </div>
                        <div className="col-12 md:col-6">
                            <KpiCard label="Montant total approuvé" value={formatCompact(data.totalAmountApproved)} icon="pi pi-check" color="#22c55e" />
                        </div>
                    </div>

                    {/* Section B: Qualité Portefeuille */}
                    <h4 className="text-primary mb-3"><i className="pi pi-chart-pie mr-2"></i>Qualité du Portefeuille</h4>
                    <div className="grid mb-4">
                        <div className="col-12 md:col-6 lg:col-3">
                            <KpiCard label="Encours brut" value={formatCompact(data.encoursBrut)} icon="pi pi-chart-line" color="#3b82f6" />
                        </div>
                        <div className="col-12 md:col-6 lg:col-3">
                            <KpiCard label="Prêts actifs" value={formatNumber(data.activeLoansCount)} icon="pi pi-list" color="#22c55e" />
                        </div>
                        <div className="col-12 md:col-4 lg:col-2">
                            <KpiCard label="PAR > 1j" value={formatPercent(data.par1)} icon="pi pi-exclamation-triangle" color={data.par1 > 10 ? '#ef4444' : '#22c55e'} />
                        </div>
                        <div className="col-12 md:col-4 lg:col-2">
                            <KpiCard label="PAR > 30j" value={formatPercent(data.par30)} icon="pi pi-exclamation-triangle" color={data.par30 > 5 ? '#ef4444' : '#f97316'} />
                        </div>
                        <div className="col-12 md:col-4 lg:col-2">
                            <KpiCard label="PAR > 90j" value={formatPercent(data.par90)} icon="pi pi-exclamation-circle" color={data.par90 > 3 ? '#ef4444' : '#f97316'} />
                        </div>
                    </div>

                    {/* Section C: Recouvrement */}
                    <h4 className="text-primary mb-3"><i className="pi pi-replay mr-2"></i>Recouvrement</h4>
                    <div className="grid mb-4">
                        <div className="col-12 md:col-6 lg:col-2">
                            <KpiCard label="Montant en retard" value={formatCompact(data.overdueAmount)} icon="pi pi-exclamation-triangle" color="#ef4444" />
                        </div>
                        <div className="col-12 md:col-6 lg:col-2">
                            <KpiCard label="Clients en retard" value={formatNumber(data.overdueClientsCount)} icon="pi pi-users" color="#f97316" />
                        </div>
                        <div className="col-12 md:col-6 lg:col-2">
                            <KpiCard label="Prêts restructurés" value={formatNumber(data.restructuredLoansCount)} icon="pi pi-refresh" color="#a855f7" />
                        </div>
                        <div className="col-12 md:col-6 lg:col-2">
                            <KpiCard label="Montant restructuré" value={formatCompact(data.restructuredAmount)} icon="pi pi-money-bill" color="#6366f1" />
                        </div>
                        <div className="col-12 md:col-6 lg:col-2">
                            <KpiCard label="Contentieux" value={formatNumber(data.litigationCount)} icon="pi pi-ban" color="#ef4444" />
                        </div>
                        <div className="col-12 md:col-6 lg:col-2">
                            <KpiCard label="Taux recouvrement" value={formatPercent(data.recoveryRate)} icon="pi pi-percentage" color="#22c55e" />
                        </div>
                    </div>

                    <Divider />

                    {/* Charts */}
                    <div className="grid mb-4">
                        <div className="col-12 lg:col-6">
                            <Card title="Pipeline des Demandes">
                                {pipelineChart && <Chart type="bar" data={pipelineChart} options={{
                                    indexAxis: 'y', plugins: { legend: { display: false } },
                                    scales: { x: { beginAtZero: true } }
                                }} />}
                            </Card>
                        </div>
                        <div className="col-12 lg:col-6">
                            <Card title="PAR par Agence">
                                {parByBranchChart && <Chart type="bar" data={parByBranchChart} options={{
                                    plugins: { legend: { position: 'bottom' } },
                                    scales: { y: { beginAtZero: true, title: { display: true, text: 'Encours (M BIF)' } },
                                              y1: { position: 'right', beginAtZero: true, title: { display: true, text: 'PAR %' }, grid: { drawOnChartArea: false } } }
                                }} />}
                            </Card>
                        </div>
                    </div>

                    {/* Top Debtors */}
                    {data.topDebtors && data.topDebtors.length > 0 && (
                        <Card title="Top 10 Débiteurs" className="mb-4">
                            <DataTable value={data.topDebtors} stripedRows size="small">
                                <Column field="clientName" header="Client" sortable />
                                <Column field="applicationNumber" header="N° Demande" />
                                <Column field="overdueAmount" header="Montant en retard" sortable body={(row) => formatBIF(row.overdueAmount)} />
                                <Column field="daysOverdue" header="Jours retard" sortable body={(row) => (
                                    <Tag severity={row.daysOverdue > 90 ? 'danger' : row.daysOverdue > 30 ? 'warning' : 'info'} value={`${row.daysOverdue}j`} />
                                )} />
                                <Column field="branchName" header="Agence" />
                            </DataTable>
                        </Card>
                    )}
                </>
            ) : (
                <Card className="text-center p-5">
                    <i className="pi pi-briefcase text-5xl text-300 mb-3" style={{ display: 'block' }}></i>
                    <p className="text-500">Cliquez sur "Appliquer" pour charger le tableau de bord</p>
                </Card>
            )}
        </div>
    );
};

function ProtectedPageWrapper() {
    return (
        <ProtectedPage requiredAuthorities={['DASHBOARD_CREDIT_OPS_VIEW']}>
            <CreditOpsDashboardPage />
        </ProtectedPage>
    );
}
export default ProtectedPageWrapper;
