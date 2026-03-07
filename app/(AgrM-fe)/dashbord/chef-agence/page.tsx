'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Toast } from 'primereact/toast';
import { Card } from 'primereact/card';
import { Chart } from 'primereact/chart';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Divider } from 'primereact/divider';
import { Calendar } from 'primereact/calendar';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import useConsumApi from '../../../../hooks/fetchData/useConsumApi';
import { API_BASE_URL } from '../../../../utils/apiConfig';
import { ProtectedPage } from '@/components/ProtectedPage';
import KpiCard from '../components/KpiCard';
import { formatBIF, formatPercent, formatCompact, formatNumber } from '../components/CurrencyFormatter';

const DASHBOARD_URL = `${API_BASE_URL}/api/dashboard/branch-manager`;
const BRANCHES_URL = `${API_BASE_URL}/api/dashboard/branches`;

interface BranchManagerDashboard {
    branchId: number;
    branchName: string;
    // Members
    totalMembers: number;
    newMembersThisMonth: number;
    newMembersLastMonth: number;
    activeDepositors: number;
    activeBorrowers: number;
    // Credit portfolio
    encoursBrut: number;
    encoursNet: number;
    par1: number;
    par30: number;
    par90: number;
    totalDisbursedThisPeriod: number;
    totalRepaidThisPeriod: number;
    // Savings
    totalSavings: number;
    savingsVoluntary: number;
    savingsObligatory: number;
    termDeposits: number;
    // Today's operations
    todayDisbursements: number;
    todayDisbursedAmount: number;
    todayRepayments: number;
    todayRepaidAmount: number;
    todayNewMembers: number;
    // Charts
    disbursementsVsRepayments: { month: string; label: string; value1: number; value2: number }[];
    applicationsPipeline: { stage: string; label: string; count: number; amount: number }[];
}

const ChefAgenceDashboardPage = () => {
    const toast = useRef<Toast>(null);
    const dashApi = useConsumApi('');
    const branchApi = useConsumApi('');

    const [data, setData] = useState<BranchManagerDashboard | null>(null);
    const [branches, setBranches] = useState<any[]>([]);
    const [startDate, setStartDate] = useState<Date | null>(new Date(new Date().getFullYear(), new Date().getMonth() - 11, 1));
    const [endDate, setEndDate] = useState<Date | null>(new Date());
    const [branchId, setBranchId] = useState<number | null>(null);

    useEffect(() => {
        branchApi.fetchData(null, 'GET', BRANCHES_URL, 'loadBranches');
    }, []);

    useEffect(() => {
        if (branchApi.data && branchApi.callType === 'loadBranches') {
            const list = Array.isArray(branchApi.data) ? branchApi.data : [];
            setBranches(list);
            if (list.length > 0 && !branchId) {
                setBranchId(list[0].id);
            }
        }
    }, [branchApi.data]);

    useEffect(() => {
        if (branchId) {
            loadDashboard();
        }
    }, [branchId]);

    useEffect(() => {
        if (dashApi.data && dashApi.callType === 'loadDashboard') {
            setData(dashApi.data as BranchManagerDashboard);
        }
        if (dashApi.error) {
            toast.current?.show({ severity: 'error', summary: 'Erreur', detail: dashApi.error.message });
        }
    }, [dashApi.data, dashApi.error]);

    const loadDashboard = () => {
        if (!branchId) {
            toast.current?.show({ severity: 'warn', summary: 'Attention', detail: 'Veuillez sélectionner une agence' });
            return;
        }
        const params = new URLSearchParams();
        params.append('branchId', branchId.toString());
        if (startDate) params.append('startDate', startDate.toISOString().split('T')[0]);
        if (endDate) params.append('endDate', endDate.toISOString().split('T')[0]);
        dashApi.fetchData(null, 'GET', `${DASHBOARD_URL}?${params.toString()}`, 'loadDashboard');
    };

    const disbVsRepChart = data?.disbursementsVsRepayments ? {
        labels: data.disbursementsVsRepayments.map(d => d.label),
        datasets: [
            { label: 'Décaissements', backgroundColor: '#3b82f6', data: data.disbursementsVsRepayments.map(d => d.value1) },
            { label: 'Remboursements', backgroundColor: '#22c55e', data: data.disbursementsVsRepayments.map(d => d.value2) }
        ]
    } : null;

    const pipelineChart = data?.applicationsPipeline ? {
        labels: data.applicationsPipeline.map(s => s.label),
        datasets: [{
            label: 'Nombre de demandes',
            backgroundColor: ['#3b82f6', '#f97316', '#22c55e', '#ef4444'],
            data: data.applicationsPipeline.map(s => s.count)
        }]
    } : null;

    const todayDate = new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    return (
        <div className="card">
            <Toast ref={toast} />

            <div className="flex align-items-center gap-2 mb-3">
                <i className="pi pi-home text-4xl text-primary"></i>
                <div>
                    <h2 className="m-0">Tableau de Bord - Chef d'Agence</h2>
                    <p className="m-0 text-500">
                        {data?.branchName ? `Agence: ${data.branchName}` : 'Sélectionnez votre agence'}
                    </p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap align-items-end gap-3 mb-4 p-3 surface-card border-round shadow-1">
                <div className="flex flex-column gap-1">
                    <label className="text-sm font-medium text-500">Agence</label>
                    <Dropdown value={branchId}
                              options={branches.map(b => ({ label: b.name, value: b.id }))}
                              onChange={(e) => setBranchId(e.value)}
                              placeholder="Sélectionner une agence"
                              className="w-14rem" />
                </div>
                <div className="flex flex-column gap-1">
                    <label className="text-sm font-medium text-500">Date début</label>
                    <Calendar value={startDate} onChange={(e) => setStartDate(e.value as Date)}
                              dateFormat="dd/mm/yy" showIcon className="w-10rem" />
                </div>
                <div className="flex flex-column gap-1">
                    <label className="text-sm font-medium text-500">Date fin</label>
                    <Calendar value={endDate} onChange={(e) => setEndDate(e.value as Date)}
                              dateFormat="dd/mm/yy" showIcon className="w-10rem" />
                </div>
                <Button label="Appliquer" icon="pi pi-refresh" onClick={loadDashboard} loading={dashApi.loading}
                        className="p-button-sm" />
            </div>

            {dashApi.loading ? (
                <div className="flex justify-content-center p-5"><ProgressSpinner /></div>
            ) : data ? (
                <>
                    {/* Section: Today's Operations */}
                    <h4 className="text-primary mb-3"><i className="pi pi-clock mr-2"></i>Opérations du Jour — {todayDate}</h4>
                    <div className="grid mb-4">
                        <div className="col-12 md:col-6 lg:col-2">
                            <KpiCard label="Décaissements" value={formatNumber(data.todayDisbursements)} icon="pi pi-send" color="#3b82f6"
                                     subtitle={formatBIF(data.todayDisbursedAmount)} />
                        </div>
                        <div className="col-12 md:col-6 lg:col-2">
                            <KpiCard label="Remboursements" value={formatNumber(data.todayRepayments)} icon="pi pi-replay" color="#22c55e"
                                     subtitle={formatBIF(data.todayRepaidAmount)} />
                        </div>
                        <div className="col-12 md:col-6 lg:col-2">
                            <KpiCard label="Nouveaux membres" value={formatNumber(data.todayNewMembers)} icon="pi pi-user-plus" color="#a855f7" />
                        </div>
                    </div>

                    {/* Section A: Members */}
                    <h4 className="text-primary mb-3"><i className="pi pi-users mr-2"></i>Membres de l'Agence</h4>
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

                    {/* Section B: Credit Portfolio */}
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
                        <div className="col-12 md:col-4">
                            <KpiCard label="PAR > 1j" value={formatPercent(data.par1)} icon="pi pi-exclamation-triangle"
                                     color={data.par1 > 10 ? '#ef4444' : '#22c55e'} />
                        </div>
                        <div className="col-12 md:col-4">
                            <KpiCard label="PAR > 30j" value={formatPercent(data.par30)} icon="pi pi-exclamation-triangle"
                                     color={data.par30 > 5 ? '#ef4444' : '#f97316'} />
                        </div>
                        <div className="col-12 md:col-4">
                            <KpiCard label="PAR > 90j" value={formatPercent(data.par90)} icon="pi pi-exclamation-circle"
                                     color={data.par90 > 3 ? '#ef4444' : '#f97316'} />
                        </div>
                    </div>

                    {/* Section C: Savings */}
                    <h4 className="text-primary mb-3"><i className="pi pi-database mr-2"></i>Épargne de l'Agence</h4>
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

                    <Divider />

                    {/* Charts */}
                    <div className="grid mb-4">
                        <div className="col-12 lg:col-8">
                            <Card title="Décaissements vs Remboursements (mensuel)">
                                {disbVsRepChart && <Chart type="bar" data={disbVsRepChart}
                                    options={{ plugins: { legend: { position: 'bottom' } }, scales: { y: { beginAtZero: true } } }} />}
                            </Card>
                        </div>
                        <div className="col-12 lg:col-4">
                            <Card title="Pipeline Demandes de Crédit">
                                {pipelineChart && <Chart type="doughnut" data={pipelineChart}
                                    options={{ plugins: { legend: { position: 'bottom' } } }} />}
                            </Card>
                        </div>
                    </div>

                    {/* Pipeline Details Table */}
                    {data.applicationsPipeline && data.applicationsPipeline.length > 0 && (
                        <Card title="Détail Pipeline Crédit" className="mb-4">
                            <DataTable value={data.applicationsPipeline} stripedRows size="small">
                                <Column field="label" header="Étape" />
                                <Column field="count" header="Nombre" body={(row) => (
                                    <Tag value={formatNumber(row.count)} severity={
                                        row.stage === 'APPROVED' ? 'success' :
                                        row.stage === 'REJECTED' ? 'danger' :
                                        row.stage === 'IN_ANALYSIS' ? 'warn' : 'info'
                                    } />
                                )} />
                            </DataTable>
                        </Card>
                    )}
                </>
            ) : (
                <Card className="text-center p-5">
                    <i className="pi pi-home text-5xl text-300 mb-3" style={{ display: 'block' }}></i>
                    <p className="text-500">Sélectionnez une agence et cliquez sur "Appliquer" pour charger le tableau de bord</p>
                </Card>
            )}
        </div>
    );
};

function ProtectedPageWrapper() {
    return (
        <ProtectedPage requiredAuthorities={['DASHBOARD_BRANCH_MANAGER_VIEW']}>
            <ChefAgenceDashboardPage />
        </ProtectedPage>
    );
}
export default ProtectedPageWrapper;
