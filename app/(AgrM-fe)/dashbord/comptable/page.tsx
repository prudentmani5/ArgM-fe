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

const DASHBOARD_URL = `${API_BASE_URL}/api/dashboard/accounting`;

interface AccountingDashboard {
    totalActif: number;
    totalPassif: number;
    equilibre: number;
    totalEntries: number;
    lastClosingDate: string;
    lastClosingStatus: string;
    cashBalance: number;
    bankBalance: number;
    netTreasury: number;
    liquidityRatio: number;
    unvalidatedEntries: number;
    provisionalEntries: number;
    reconciliationPending: number;
    autoEntries: number;
    totalRevenue: number;
    totalExpenses: number;
    netResult: number;
    revenueVsExpensesTrend: { month: string; label: string; value1: number; value2: number }[];
    treasuryTrend: { month: string; label: string; value1: number; value2: number }[];
    expensesByCategory: { label: string; value: number }[];
    balanceSummary: { accountCode: string; accountLabel: string; debit: number; credit: number; balance: number }[];
}

const ComptableDashboardPage = () => {
    const toast = useRef<Toast>(null);
    const dashApi = useConsumApi('');

    const [data, setData] = useState<AccountingDashboard | null>(null);
    const [startDate, setStartDate] = useState<Date | null>(new Date(new Date().getFullYear(), 0, 1));
    const [endDate, setEndDate] = useState<Date | null>(new Date());

    useEffect(() => {
        loadDashboard();
    }, []);

    useEffect(() => {
        if (dashApi.data && dashApi.callType === 'loadDashboard') {
            setData(dashApi.data as AccountingDashboard);
        }
        if (dashApi.error) {
            toast.current?.show({ severity: 'error', summary: 'Erreur', detail: dashApi.error.message });
        }
    }, [dashApi.data, dashApi.error]);

    const loadDashboard = () => {
        const params = new URLSearchParams();
        if (startDate) params.append('startDate', startDate.toISOString().split('T')[0]);
        if (endDate) params.append('endDate', endDate.toISOString().split('T')[0]);
        dashApi.fetchData(null, 'GET', `${DASHBOARD_URL}?${params.toString()}`, 'loadDashboard');
    };

    const revVsExpChart = data?.revenueVsExpensesTrend ? {
        labels: data.revenueVsExpensesTrend.map(d => d.label),
        datasets: [
            { label: 'Produits', backgroundColor: '#22c55e', data: data.revenueVsExpensesTrend.map(d => d.value1) },
            { label: 'Charges', backgroundColor: '#ef4444', data: data.revenueVsExpensesTrend.map(d => d.value2) },
            { label: 'Résultat', type: 'line' as const, borderColor: '#3b82f6', data: data.revenueVsExpensesTrend.map(d => d.value1 - d.value2), fill: false }
        ]
    } : null;

    const expPieData = data?.expensesByCategory && data.expensesByCategory.length > 0 ? {
        labels: data.expensesByCategory.map(c => c.label),
        datasets: [{
            data: data.expensesByCategory.map(c => c.value),
            backgroundColor: ['#3b82f6', '#22c55e', '#f97316', '#a855f7', '#ef4444', '#6366f1', '#14b8a6', '#f59e0b', '#ec4899']
        }]
    } : null;

    const equilibreColor = data && Math.abs(data.equilibre) < 1 ? '#22c55e' : '#ef4444';

    return (
        <div className="card">
            <Toast ref={toast} />

            <div className="flex align-items-center gap-2 mb-3">
                <i className="pi pi-calculator text-4xl text-primary"></i>
                <div>
                    <h2 className="m-0">Tableau de Bord - Comptabilité</h2>
                    <p className="m-0 text-500">Situation comptable, trésorerie et opérations</p>
                </div>
            </div>

            <DashboardFilters startDate={startDate} endDate={endDate} branchId={null}
                branches={[]} onStartDateChange={setStartDate} onEndDateChange={setEndDate}
                onBranchChange={() => {}} onApply={loadDashboard} loading={dashApi.loading} showBranch={false} />

            {dashApi.loading ? (
                <div className="flex justify-content-center p-5"><ProgressSpinner /></div>
            ) : data ? (
                <>
                    {/* Section A: Situation Comptable */}
                    <h4 className="text-primary mb-3"><i className="pi pi-book mr-2"></i>Situation Comptable</h4>
                    <div className="grid mb-4">
                        <div className="col-12 md:col-6 lg:col-2">
                            <KpiCard label="Total Actif" value={formatCompact(data.totalActif)} icon="pi pi-arrow-up-right" color="#3b82f6" />
                        </div>
                        <div className="col-12 md:col-6 lg:col-2">
                            <KpiCard label="Total Passif" value={formatCompact(data.totalPassif)} icon="pi pi-arrow-down-right" color="#a855f7" />
                        </div>
                        <div className="col-12 md:col-6 lg:col-2">
                            <KpiCard label="Équilibre" value={formatCompact(data.equilibre)} icon="pi pi-equals" color={equilibreColor} />
                        </div>
                        <div className="col-12 md:col-6 lg:col-2">
                            <KpiCard label="Écritures" value={formatNumber(data.totalEntries)} icon="pi pi-file-edit" color="#f97316" />
                        </div>
                        <div className="col-12 md:col-6 lg:col-2">
                            <KpiCard label="Dernière clôture" value={data.lastClosingDate || 'N/A'} icon="pi pi-calendar-times" color="#6366f1"
                                subtitle={data.lastClosingStatus || ''} />
                        </div>
                    </div>

                    {/* Section B: Trésorerie */}
                    <h4 className="text-primary mb-3"><i className="pi pi-wallet mr-2"></i>Trésorerie</h4>
                    <div className="grid mb-4">
                        <div className="col-12 md:col-6 lg:col-3">
                            <KpiCard label="Caisse (57x)" value={formatCompact(data.cashBalance)} icon="pi pi-money-bill" color="#22c55e" />
                        </div>
                        <div className="col-12 md:col-6 lg:col-3">
                            <KpiCard label="Banque (52x)" value={formatCompact(data.bankBalance)} icon="pi pi-building" color="#3b82f6" />
                        </div>
                        <div className="col-12 md:col-6 lg:col-3">
                            <KpiCard label="Trésorerie nette" value={formatCompact(data.netTreasury)} icon="pi pi-chart-bar" color={data.netTreasury >= 0 ? '#22c55e' : '#ef4444'} />
                        </div>
                        <div className="col-12 md:col-6 lg:col-3">
                            <KpiCard label="Ratio liquidité" value={formatPercent(data.liquidityRatio)} icon="pi pi-percentage" color="#a855f7" />
                        </div>
                    </div>

                    {/* Section C: Opérations à Traiter */}
                    <h4 className="text-primary mb-3"><i className="pi pi-exclamation-triangle mr-2"></i>Opérations à Traiter</h4>
                    <div className="grid mb-4">
                        <div className="col-12 md:col-6 lg:col-3">
                            <KpiCard label="Non validées" value={formatNumber(data.unvalidatedEntries)} icon="pi pi-times-circle" color={data.unvalidatedEntries > 0 ? '#ef4444' : '#22c55e'} />
                        </div>
                        <div className="col-12 md:col-6 lg:col-3">
                            <KpiCard label="Provisoires" value={formatNumber(data.provisionalEntries)} icon="pi pi-clock" color="#f97316" />
                        </div>
                        <div className="col-12 md:col-6 lg:col-3">
                            <KpiCard label="Rapprochement en attente" value={formatNumber(data.reconciliationPending)} icon="pi pi-sync" color="#a855f7" />
                        </div>
                        <div className="col-12 md:col-6 lg:col-3">
                            <KpiCard label="Écritures auto" value={formatNumber(data.autoEntries)} icon="pi pi-bolt" color="#6366f1" />
                        </div>
                    </div>

                    {/* Section D: Résultats */}
                    <h4 className="text-primary mb-3"><i className="pi pi-dollar mr-2"></i>Résultats</h4>
                    <div className="grid mb-4">
                        <div className="col-12 md:col-4">
                            <KpiCard label="Produits (Classe 7)" value={formatCompact(data.totalRevenue)} icon="pi pi-arrow-up" color="#22c55e" />
                        </div>
                        <div className="col-12 md:col-4">
                            <KpiCard label="Charges (Classe 6)" value={formatCompact(data.totalExpenses)} icon="pi pi-arrow-down" color="#ef4444" />
                        </div>
                        <div className="col-12 md:col-4">
                            <KpiCard label="Résultat net" value={formatCompact(data.netResult)} icon="pi pi-chart-bar" color={data.netResult >= 0 ? '#22c55e' : '#ef4444'} />
                        </div>
                    </div>

                    <Divider />

                    {/* Charts */}
                    <div className="grid mb-4">
                        <div className="col-12 lg:col-8">
                            <Card title="Produits vs Charges (mensuel)">
                                {revVsExpChart && <Chart type="bar" data={revVsExpChart} options={{
                                    plugins: { legend: { position: 'bottom' } },
                                    scales: { y: { beginAtZero: true } }
                                }} />}
                            </Card>
                        </div>
                        <div className="col-12 lg:col-4">
                            <Card title="Charges par Catégorie">
                                {expPieData && <Chart type="doughnut" data={expPieData} options={{
                                    plugins: { legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 10 } } } }
                                }} />}
                            </Card>
                        </div>
                    </div>

                    {/* Balance Summary Table */}
                    {data.balanceSummary && data.balanceSummary.length > 0 && (
                        <Card title="Balance des Comptes" className="mb-4">
                            <DataTable value={data.balanceSummary} stripedRows size="small" paginator rows={15}
                                       sortField="accountCode" sortOrder={1}>
                                <Column field="accountCode" header="Code Compte" sortable style={{ width: '120px' }} />
                                <Column field="accountLabel" header="Libellé" sortable />
                                <Column field="debit" header="Débit" sortable body={(row) => formatBIF(row.debit)} className="text-right" />
                                <Column field="credit" header="Crédit" sortable body={(row) => formatBIF(row.credit)} className="text-right" />
                                <Column field="balance" header="Solde" sortable body={(row) => (
                                    <span style={{ color: row.balance >= 0 ? '#22c55e' : '#ef4444', fontWeight: 'bold' }}>
                                        {formatBIF(row.balance)}
                                    </span>
                                )} className="text-right" />
                            </DataTable>
                        </Card>
                    )}
                </>
            ) : (
                <Card className="text-center p-5">
                    <i className="pi pi-calculator text-5xl text-300 mb-3" style={{ display: 'block' }}></i>
                    <p className="text-500">Cliquez sur "Appliquer" pour charger le tableau de bord</p>
                </Card>
            )}
        </div>
    );
};

function ProtectedPageWrapper() {
    return (
        <ProtectedPage requiredAuthorities={['DASHBOARD_ACCOUNTING_VIEW']}>
            <ComptableDashboardPage />
        </ProtectedPage>
    );
}
export default ProtectedPageWrapper;
