'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Toast } from 'primereact/toast';
import { Card } from 'primereact/card';
import { Chart } from 'primereact/chart';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Divider } from 'primereact/divider';
import useConsumApi from '../../../../hooks/fetchData/useConsumApi';
import { API_BASE_URL } from '../../../../utils/apiConfig';
import { ProtectedPage } from '@/components/ProtectedPage';
import KpiCard from '../components/KpiCard';
import DashboardFilters from '../components/DashboardFilters';
import { formatBIF, formatPercent, formatCompact, formatNumber } from '../components/CurrencyFormatter';

const DASHBOARD_URL = `${API_BASE_URL}/api/dashboard/dg`;
const BRANCHES_URL = `${API_BASE_URL}/api/dashboard`;

interface DgDashboard {
    totalMembers: number;
    newMembersThisMonth: number;
    newMembersLastMonth: number;
    activeBorrowers: number;
    activeDepositors: number;
    encoursBrut: number;
    encoursNet: number;
    totalDisbursedThisPeriod: number;
    totalRepaidThisPeriod: number;
    par1: number;
    par30: number;
    par90: number;
    defaultRate: number;
    provisionAmount: number;
    totalSavings: number;
    savingsVoluntary: number;
    savingsObligatory: number;
    termDeposits: number;
    tontineBalance: number;
    totalRevenue: number;
    totalExpenses: number;
    netResult: number;
    operationalSelfSufficiency: number;
    roa: number;
    roe: number;
    solvabilityRatio: number;
    liquidityRatio: number;
    disbursementsVsRepayments: { month: string; label: string; value1: number; value2: number }[];
    branchPerformance: { branchId: number; branchName: string; memberCount: number; loanOutstanding: number; savingsVolume: number; par30: number }[];
}

const DgDashboardPage = () => {
    const toast = useRef<Toast>(null);
    const dashApi = useConsumApi('');
    const branchApi = useConsumApi('');

    const [data, setData] = useState<DgDashboard | null>(null);
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
            setData(dashApi.data as DgDashboard);
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

    const disbVsRepChart = data?.disbursementsVsRepayments ? {
        labels: data.disbursementsVsRepayments.map(d => d.label),
        datasets: [
            { label: 'Décaissements', backgroundColor: '#3b82f6', data: data.disbursementsVsRepayments.map(d => d.value1) },
            { label: 'Remboursements', backgroundColor: '#22c55e', data: data.disbursementsVsRepayments.map(d => d.value2) }
        ]
    } : null;

    const savingsPieData = data ? {
        labels: ['Épargne Libre', 'Épargne Obligatoire', 'Dépôts à Terme', 'Tontine'],
        datasets: [{
            data: [data.savingsVoluntary || 0, data.savingsObligatory || 0, data.termDeposits || 0, data.tontineBalance || 0],
            backgroundColor: ['#3b82f6', '#22c55e', '#a855f7', '#f97316']
        }]
    } : null;

    return (
        <div className="card">
            <Toast ref={toast} />

            <div className="flex align-items-center gap-2 mb-3">
                <i className="pi pi-building text-4xl text-primary"></i>
                <div>
                    <h2 className="m-0">Tableau de Bord - Direction Générale</h2>
                    <p className="m-0 text-500">Vue d'ensemble de la performance de l'institution</p>
                </div>
            </div>

            <DashboardFilters startDate={startDate} endDate={endDate} branchId={branchId}
                branches={branches} onStartDateChange={setStartDate} onEndDateChange={setEndDate}
                onBranchChange={setBranchId} onApply={loadDashboard} loading={dashApi.loading} />

            {dashApi.loading ? (
                <div className="flex justify-content-center p-5"><ProgressSpinner /></div>
            ) : data ? (
                <>
                    {/* Section A: Performance Commerciale */}
                    <h4 className="text-primary mb-3"><i className="pi pi-users mr-2"></i>Performance Commerciale</h4>
                    <div className="grid mb-4">
                        <div className="col-12 md:col-6 lg:col-3">
                            <KpiCard label="Membres actifs" value={formatNumber(data.totalMembers)} icon="pi pi-users" color="#3b82f6" />
                        </div>
                        <div className="col-12 md:col-6 lg:col-3">
                            <KpiCard label="Nouveaux ce mois" value={formatNumber(data.newMembersThisMonth)} icon="pi pi-user-plus" color="#22c55e"
                                trend={data.newMembersLastMonth > 0 ? ((data.newMembersThisMonth - data.newMembersLastMonth) / data.newMembersLastMonth * 100) : null} />
                        </div>
                        <div className="col-12 md:col-6 lg:col-3">
                            <KpiCard label="Emprunteurs actifs" value={formatNumber(data.activeBorrowers)} icon="pi pi-wallet" color="#f97316" />
                        </div>
                        <div className="col-12 md:col-6 lg:col-3">
                            <KpiCard label="Épargnants actifs" value={formatNumber(data.activeDepositors)} icon="pi pi-database" color="#a855f7" />
                        </div>
                    </div>

                    {/* Section B: Portefeuille Crédit */}
                    <h4 className="text-primary mb-3"><i className="pi pi-briefcase mr-2"></i>Portefeuille Crédit</h4>
                    <div className="grid mb-4">
                        <div className="col-12 md:col-6 lg:col-3">
                            <KpiCard label="Encours brut" value={formatCompact(data.encoursBrut)} icon="pi pi-chart-line" color="#3b82f6" />
                        </div>
                        <div className="col-12 md:col-6 lg:col-3">
                            <KpiCard label="Encours net" value={formatCompact(data.encoursNet)} icon="pi pi-chart-line" color="#22c55e" />
                        </div>
                        <div className="col-12 md:col-6 lg:col-3">
                            <KpiCard label="Décaissé (période)" value={formatCompact(data.totalDisbursedThisPeriod)} icon="pi pi-send" color="#f97316" />
                        </div>
                        <div className="col-12 md:col-6 lg:col-3">
                            <KpiCard label="Remboursé (période)" value={formatCompact(data.totalRepaidThisPeriod)} icon="pi pi-replay" color="#a855f7" />
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
                        <div className="col-12 md:col-4 lg:col-2">
                            <KpiCard label="Taux défaut" value={formatPercent(data.defaultRate)} icon="pi pi-ban" color="#ef4444" />
                        </div>
                        <div className="col-12 md:col-4 lg:col-2">
                            <KpiCard label="Provisions" value={formatCompact(data.provisionAmount)} icon="pi pi-shield" color="#6366f1" />
                        </div>
                    </div>

                    {/* Section C: Épargne */}
                    <h4 className="text-primary mb-3"><i className="pi pi-database mr-2"></i>Épargne</h4>
                    <div className="grid mb-4">
                        <div className="col-12 md:col-6 lg:col-3">
                            <KpiCard label="Total épargne" value={formatCompact(data.totalSavings)} icon="pi pi-database" color="#3b82f6" />
                        </div>
                        <div className="col-12 md:col-6 lg:col-3">
                            <KpiCard label="Épargne libre" value={formatCompact(data.savingsVoluntary)} icon="pi pi-wallet" color="#22c55e" />
                        </div>
                        <div className="col-12 md:col-6 lg:col-3">
                            <KpiCard label="Épargne obligatoire" value={formatCompact(data.savingsObligatory)} icon="pi pi-lock" color="#f97316" />
                        </div>
                        <div className="col-12 md:col-6 lg:col-3">
                            <KpiCard label="Dépôts à terme" value={formatCompact(data.termDeposits)} icon="pi pi-calendar" color="#a855f7" />
                        </div>
                    </div>

                    {/* Section D: Performance Financière */}
                    <h4 className="text-primary mb-3"><i className="pi pi-dollar mr-2"></i>Performance Financière</h4>
                    <div className="grid mb-4">
                        <div className="col-12 md:col-6 lg:col-3">
                            <KpiCard label="Produits" value={formatCompact(data.totalRevenue)} icon="pi pi-arrow-up" color="#22c55e" />
                        </div>
                        <div className="col-12 md:col-6 lg:col-3">
                            <KpiCard label="Charges" value={formatCompact(data.totalExpenses)} icon="pi pi-arrow-down" color="#ef4444" />
                        </div>
                        <div className="col-12 md:col-6 lg:col-3">
                            <KpiCard label="Résultat net" value={formatCompact(data.netResult)} icon="pi pi-chart-bar" color={data.netResult >= 0 ? '#22c55e' : '#ef4444'} />
                        </div>
                        <div className="col-12 md:col-6 lg:col-3">
                            <KpiCard label="Autosuffisance opérat." value={formatPercent(data.operationalSelfSufficiency)} icon="pi pi-percentage" color="#6366f1" />
                        </div>
                    </div>

                    {/* Section E: Ratios Prudentiels */}
                    <h4 className="text-primary mb-3"><i className="pi pi-shield mr-2"></i>Ratios Prudentiels</h4>
                    <div className="grid mb-4">
                        <div className="col-12 md:col-6 lg:col-3">
                            <KpiCard label="ROA" value={formatPercent(data.roa)} icon="pi pi-percentage" color="#3b82f6" />
                        </div>
                        <div className="col-12 md:col-6 lg:col-3">
                            <KpiCard label="ROE" value={formatPercent(data.roe)} icon="pi pi-percentage" color="#22c55e" />
                        </div>
                        <div className="col-12 md:col-6 lg:col-3">
                            <KpiCard label="Ratio solvabilité" value={formatPercent(data.solvabilityRatio)} icon="pi pi-shield" color="#f97316" />
                        </div>
                        <div className="col-12 md:col-6 lg:col-3">
                            <KpiCard label="Ratio liquidité" value={formatPercent(data.liquidityRatio)} icon="pi pi-water" color="#a855f7" />
                        </div>
                    </div>

                    <Divider />

                    {/* Charts */}
                    <div className="grid mb-4">
                        <div className="col-12 lg:col-8">
                            <Card title="Décaissements vs Remboursements (mensuel)">
                                {disbVsRepChart && <Chart type="bar" data={disbVsRepChart} options={{ plugins: { legend: { position: 'bottom' } }, scales: { y: { beginAtZero: true } } }} />}
                            </Card>
                        </div>
                        <div className="col-12 lg:col-4">
                            <Card title="Répartition Épargne">
                                {savingsPieData && <Chart type="pie" data={savingsPieData} options={{ plugins: { legend: { position: 'bottom' } } }} />}
                            </Card>
                        </div>
                    </div>

                    {/* Branch Performance Table */}
                    {data.branchPerformance && data.branchPerformance.length > 0 && (
                        <Card title="Performance par Agence" className="mb-4">
                            <DataTable value={data.branchPerformance} stripedRows size="small" paginator rows={10}>
                                <Column field="branchName" header="Agence" sortable />
                                <Column field="memberCount" header="Membres" sortable body={(row) => formatNumber(row.memberCount)} />
                                <Column field="loanOutstanding" header="Encours crédit" sortable body={(row) => formatBIF(row.loanOutstanding)} />
                                <Column field="savingsVolume" header="Volume épargne" sortable body={(row) => formatBIF(row.savingsVolume)} />
                                <Column field="par30" header="PAR > 30j" sortable body={(row) => (
                                    <span style={{ color: row.par30 > 5 ? '#ef4444' : '#22c55e', fontWeight: 'bold' }}>{formatPercent(row.par30)}</span>
                                )} />
                            </DataTable>
                        </Card>
                    )}
                </>
            ) : (
                <Card className="text-center p-5">
                    <i className="pi pi-chart-bar text-5xl text-300 mb-3" style={{ display: 'block' }}></i>
                    <p className="text-500">Cliquez sur "Appliquer" pour charger le tableau de bord</p>
                </Card>
            )}
        </div>
    );
};

function ProtectedPageWrapper() {
    return (
        <ProtectedPage requiredAuthorities={['DASHBOARD_DG_VIEW']}>
            <DgDashboardPage />
        </ProtectedPage>
    );
}
export default ProtectedPageWrapper;
