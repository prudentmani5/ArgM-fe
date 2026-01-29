'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from 'primereact/button';
import { Calendar } from 'primereact/calendar';
import { Toast } from 'primereact/toast';
import { Card } from 'primereact/card';
import { Chart } from 'primereact/chart';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Divider } from 'primereact/divider';
import { Tag } from 'primereact/tag';
import useConsumApi from '../../../../../hooks/fetchData/useConsumApi';
import { buildApiUrl } from '../../../../../utils/apiConfig';

interface SyntheseStat {
    label: string;
    value: number;
    change?: number;
    trend?: 'up' | 'down' | 'stable';
}

interface TopClient {
    clientName: string;
    creditNumber: string;
    totalDue: number;
    daysOverdue: number;
    classification: string;
}

export default function SyntheseRemboursementPage() {
    const [dateDebut, setDateDebut] = useState<Date | null>(() => {
        const date = new Date();
        date.setMonth(date.getMonth() - 1);
        return date;
    });
    const [dateFin, setDateFin] = useState<Date | null>(new Date());
    const [stats, setStats] = useState({
        totalCredits: 0,
        totalOutstanding: 0,
        totalCollected: 0,
        collectionRate: 0,
        overdueCount: 0,
        overdueAmount: 0,
        litigationCount: 0,
        litigationAmount: 0
    });
    const [paymentTrend, setPaymentTrend] = useState<any>({});
    const [classificationChart, setClassificationChart] = useState<any>({});
    const [topOverdue, setTopOverdue] = useState<TopClient[]>([]);
    const toast = useRef<Toast>(null);

    const { data, loading, error, fetchData, callType } = useConsumApi('');
    const BASE_URL = buildApiUrl('/api/remboursement/reports/summary');

    useEffect(() => {
        // Initialize with sample chart data
        initializeCharts();
    }, []);

    useEffect(() => {
        if (data && callType === 'search') {
            if (data.stats) setStats(data.stats);
            if (data.topOverdue) setTopOverdue(data.topOverdue);
            if (data.paymentTrend) updatePaymentTrendChart(data.paymentTrend);
            if (data.classification) updateClassificationChart(data.classification);
        }
        if (error) {
            toast.current?.show({ severity: 'error', summary: 'Erreur', detail: error.message || 'Une erreur est survenue', life: 3000 });
        }
    }, [data, error, callType]);

    const initializeCharts = () => {
        // Payment trend chart
        setPaymentTrend({
            labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun'],
            datasets: [
                {
                    label: 'Paiements Attendus',
                    data: [0, 0, 0, 0, 0, 0],
                    fill: false,
                    borderColor: '#3b82f6',
                    tension: 0.4
                },
                {
                    label: 'Paiements Reçus',
                    data: [0, 0, 0, 0, 0, 0],
                    fill: false,
                    borderColor: '#22c55e',
                    tension: 0.4
                }
            ]
        });

        // Classification chart
        setClassificationChart({
            labels: ['Normal', 'À surveiller', 'Douteux', 'Contentieux'],
            datasets: [{
                data: [0, 0, 0, 0],
                backgroundColor: ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444']
            }]
        });
    };

    const updatePaymentTrendChart = (trendData: any) => {
        setPaymentTrend({
            labels: trendData.labels || [],
            datasets: [
                {
                    label: 'Paiements Attendus',
                    data: trendData.expected || [],
                    fill: false,
                    borderColor: '#3b82f6',
                    tension: 0.4
                },
                {
                    label: 'Paiements Reçus',
                    data: trendData.received || [],
                    fill: false,
                    borderColor: '#22c55e',
                    tension: 0.4
                }
            ]
        });
    };

    const updateClassificationChart = (classData: any) => {
        setClassificationChart({
            labels: ['Normal', 'À surveiller', 'Douteux', 'Contentieux'],
            datasets: [{
                data: [
                    classData.normal || 0,
                    classData.watch || 0,
                    classData.doubtful || 0,
                    classData.litigation || 0
                ],
                backgroundColor: ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444']
            }]
        });
    };

    const handleSearch = () => {
        const params = new URLSearchParams();
        if (dateDebut) params.append('dateDebut', dateDebut.toISOString().split('T')[0]);
        if (dateFin) params.append('dateFin', dateFin.toISOString().split('T')[0]);

        fetchData(null, 'GET', `${BASE_URL}?${params.toString()}`, 'search');
    };

    const handleExport = () => {
        toast.current?.show({ severity: 'info', summary: 'Export', detail: 'Génération du rapport PDF en cours...', life: 3000 });
    };

    const formatCurrency = (value: number | undefined) => {
        if (value === undefined || value === null) return '-';
        return new Intl.NumberFormat('fr-BI', { style: 'currency', currency: 'BIF' }).format(value);
    };

    const classificationBodyTemplate = (rowData: TopClient) => {
        const labels: { [key: string]: string } = {
            'NORMAL': 'Normal',
            'WATCH': 'À surveiller',
            'DOUBTFUL': 'Douteux',
            'LITIGATION': 'Contentieux'
        };
        const severities: { [key: string]: 'success' | 'info' | 'warning' | 'danger' } = {
            'NORMAL': 'success',
            'WATCH': 'info',
            'DOUBTFUL': 'warning',
            'LITIGATION': 'danger'
        };
        return <Tag value={labels[rowData.classification] || rowData.classification} severity={severities[rowData.classification] || 'secondary'} />;
    };

    const chartOptions = {
        plugins: {
            legend: {
                position: 'bottom' as const
            }
        },
        responsive: true,
        maintainAspectRatio: false
    };

    return (
        <div className="card">
            <Toast ref={toast} />

            <div className="flex flex-wrap align-items-center justify-content-between mb-4">
                <h2 className="m-0">
                    <i className="pi pi-chart-pie mr-2"></i>
                    Synthèse Remboursement
                </h2>
                <Button label="Exporter PDF" icon="pi pi-file-pdf" severity="help" onClick={handleExport} />
            </div>

            <Card className="mb-4">
                <div className="grid">
                    <div className="col-12 md:col-4">
                        <div className="field">
                            <label htmlFor="dateDebut" className="font-semibold">Période du</label>
                            <Calendar
                                id="dateDebut"
                                value={dateDebut}
                                onChange={(e) => setDateDebut(e.value as Date)}
                                className="w-full"
                                dateFormat="dd/mm/yy"
                                showIcon
                            />
                        </div>
                    </div>
                    <div className="col-12 md:col-4">
                        <div className="field">
                            <label htmlFor="dateFin" className="font-semibold">Au</label>
                            <Calendar
                                id="dateFin"
                                value={dateFin}
                                onChange={(e) => setDateFin(e.value as Date)}
                                className="w-full"
                                dateFormat="dd/mm/yy"
                                showIcon
                            />
                        </div>
                    </div>
                    <div className="col-12 md:col-4 flex align-items-end">
                        <Button label="Générer Synthèse" icon="pi pi-refresh" onClick={handleSearch} className="w-full" loading={loading} />
                    </div>
                </div>
            </Card>

            {/* Key Performance Indicators */}
            <div className="grid mb-4">
                <div className="col-12 md:col-3">
                    <Card className="bg-blue-100 h-full">
                        <div className="text-center">
                            <i className="pi pi-wallet text-4xl text-blue-500 mb-2"></i>
                            <div className="text-2xl font-bold text-blue-700">{stats.totalCredits}</div>
                            <div className="text-500">Crédits Actifs</div>
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
                            <div className="text-2xl font-bold text-purple-700">{stats.collectionRate}%</div>
                            <div className="text-500">Taux de Recouvrement</div>
                        </div>
                    </Card>
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid mb-4">
                <div className="col-12 md:col-8">
                    <Card title="Tendance des Paiements" className="h-full">
                        <div style={{ height: '300px' }}>
                            <Chart type="line" data={paymentTrend} options={chartOptions} style={{ height: '100%' }} />
                        </div>
                    </Card>
                </div>
                <div className="col-12 md:col-4">
                    <Card title="Classification des Retards" className="h-full">
                        <div style={{ height: '300px' }}>
                            <Chart type="doughnut" data={classificationChart} options={chartOptions} style={{ height: '100%' }} />
                        </div>
                    </Card>
                </div>
            </div>

            {/* Secondary Stats */}
            <div className="grid mb-4">
                <div className="col-12 md:col-6">
                    <Card className="bg-red-50">
                        <div className="flex align-items-center justify-content-between">
                            <div>
                                <div className="text-500 mb-1">Dossiers Contentieux</div>
                                <div className="text-2xl font-bold text-red-700">{stats.litigationCount}</div>
                            </div>
                            <div className="text-right">
                                <div className="text-500 mb-1">Montant en Contentieux</div>
                                <div className="text-xl font-semibold text-red-600">{formatCurrency(stats.litigationAmount)}</div>
                            </div>
                        </div>
                    </Card>
                </div>
                <div className="col-12 md:col-6">
                    <Card className="bg-cyan-50">
                        <div className="flex align-items-center justify-content-between">
                            <div>
                                <div className="text-500 mb-1">Encours Total</div>
                                <div className="text-2xl font-bold text-cyan-700">{formatCurrency(stats.totalOutstanding)}</div>
                            </div>
                            <div className="text-right">
                                <div className="text-500 mb-1">Taux de Retard</div>
                                <div className="text-xl font-semibold text-cyan-600">
                                    {stats.totalOutstanding > 0 ? Math.round((stats.overdueAmount / stats.totalOutstanding) * 100) : 0}%
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>

            {/* Top Overdue Clients */}
            <Card title="Top 10 - Clients avec les Plus Gros Impayés" className="mb-4">
                <DataTable
                    value={topOverdue}
                    loading={loading && callType === 'search'}
                    emptyMessage="Aucune donnée disponible. Veuillez générer la synthèse."
                    stripedRows
                    rows={10}
                >
                    <Column field="clientName" header="Client" sortable />
                    <Column field="creditNumber" header="N° Crédit" />
                    <Column field="totalDue" header="Montant Dû" body={(row) => formatCurrency(row.totalDue)} sortable />
                    <Column field="daysOverdue" header="Jours Retard" body={(row) => <Tag value={`${row.daysOverdue} jours`} severity={row.daysOverdue > 90 ? 'danger' : row.daysOverdue > 30 ? 'warning' : 'info'} />} sortable />
                    <Column field="classification" header="Classification" body={classificationBodyTemplate} />
                </DataTable>
            </Card>

            <Divider />

            <div className="text-center text-500">
                <i className="pi pi-info-circle mr-2"></i>
                Les données sont calculées en temps réel à partir de la base de données.
            </div>
        </div>
    );
}
