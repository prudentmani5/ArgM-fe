'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card } from 'primereact/card';
import { Toast } from 'primereact/toast';
import { Chart } from 'primereact/chart';
import { Calendar } from 'primereact/calendar';
import { Dropdown } from 'primereact/dropdown';
import { Tag } from 'primereact/tag';
import { buildApiUrl } from '@/utils/apiConfig';
import useConsumApi from '@/hooks/fetchData/useConsumApi';

export default function SynthesePortefeuillePage() {
    const [demandes, setDemandes] = useState<any[]>([]);
    const [decaissements, setDecaissements] = useState<any[]>([]);
    const [branches, setBranches] = useState<any[]>([]);
    const [dateRange, setDateRange] = useState<Date[] | null>(null);
    const [branchFilter, setBranchFilter] = useState<number | null>(null);
    const toast = useRef<Toast>(null);

    // Use separate hook instances for each data type to avoid race conditions
    const demandesApi = useConsumApi('');
    const decaissementsApi = useConsumApi('');
    const branchesApi = useConsumApi('');

    useEffect(() => {
        loadDemandes();
        loadDecaissements();
        loadBranches();
    }, []);

    // Handle demandes data
    useEffect(() => {
        if (demandesApi.data) {
            setDemandes(Array.isArray(demandesApi.data) ? demandesApi.data : demandesApi.data.content || []);
        }
        if (demandesApi.error) {
            toast.current?.show({ severity: 'error', summary: 'Erreur', detail: demandesApi.error.message, life: 3000 });
        }
    }, [demandesApi.data, demandesApi.error]);

    // Handle decaissements data
    useEffect(() => {
        if (decaissementsApi.data) {
            setDecaissements(Array.isArray(decaissementsApi.data) ? decaissementsApi.data : decaissementsApi.data.content || []);
        }
        if (decaissementsApi.error) {
            toast.current?.show({ severity: 'error', summary: 'Erreur', detail: decaissementsApi.error.message, life: 3000 });
        }
    }, [decaissementsApi.data, decaissementsApi.error]);

    // Handle branches data
    useEffect(() => {
        if (branchesApi.data) {
            setBranches(Array.isArray(branchesApi.data) ? branchesApi.data : branchesApi.data.content || []);
        }
        if (branchesApi.error) {
            toast.current?.show({ severity: 'error', summary: 'Erreur', detail: branchesApi.error.message, life: 3000 });
        }
    }, [branchesApi.data, branchesApi.error]);

    const loadDemandes = () => {
        demandesApi.fetchData(null, 'GET', buildApiUrl('/api/credit/applications/findall'), 'loadDemandes');
    };

    const loadDecaissements = () => {
        decaissementsApi.fetchData(null, 'GET', buildApiUrl('/api/credit/disbursements/findall'), 'loadDecaissements');
    };

    const loadBranches = () => {
        branchesApi.fetchData(null, 'GET', buildApiUrl('/api/reference-data/branches/findall'), 'loadBranches');
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'BIF',
            minimumFractionDigits: 0
        }).format(value || 0);
    };

    // Filter data based on filters
    const filteredDemandes = demandes.filter((d: any) => {
        let match = true;
        if (branchFilter) match = match && d.branchId === branchFilter;
        if (dateRange && dateRange[0]) {
            const appDate = new Date(d.applicationDate);
            match = match && appDate >= dateRange[0];
            if (dateRange[1]) match = match && appDate <= dateRange[1];
        }
        return match;
    });

    const filteredDecaissements = decaissements.filter((d: any) => {
        let match = true;
        if (branchFilter) match = match && d.branchId === branchFilter;
        if (dateRange && dateRange[0]) {
            const disbDate = new Date(d.disbursementDate);
            match = match && disbDate >= dateRange[0];
            if (dateRange[1]) match = match && disbDate <= dateRange[1];
        }
        return match;
    });

    // Calculate KPIs
    const totalDemandes = filteredDemandes.length;
    const totalMontantDemande = filteredDemandes.reduce((sum, d) => sum + (d.amountRequested || 0), 0);
    const approuvees = filteredDemandes.filter(d => ['APPROUVE', 'APPROUVE_SOUS_RESERVE', 'DECAISSE'].includes(d.statusCode)).length;
    const rejetees = filteredDemandes.filter(d => d.statusCode === 'REJETE').length;
    const enCours = filteredDemandes.filter(d => ['SOUMISE', 'EN_ANALYSE', 'EN_VISITE', 'EN_COMITE'].includes(d.statusCode)).length;
    const tauxApprobation = totalDemandes > 0 ? ((approuvees / totalDemandes) * 100).toFixed(1) : '0';

    const totalDecaisse = filteredDecaissements.reduce((sum, d) => sum + (d.amount || 0), 0);
    const nombreDecaissements = filteredDecaissements.length;

    // Chart data - Status distribution
    const statusChartData = {
        labels: ['Approuvées', 'Rejetées', 'En Cours'],
        datasets: [{
            data: [approuvees, rejetees, enCours],
            backgroundColor: ['#22c55e', '#ef4444', '#f59e0b'],
            hoverBackgroundColor: ['#16a34a', '#dc2626', '#d97706']
        }]
    };

    // Chart data - Monthly trend (simulated)
    const monthLabels = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin'];
    const monthlyTrendData = {
        labels: monthLabels,
        datasets: [
            {
                label: 'Demandes',
                backgroundColor: '#3b82f6',
                data: [12, 15, 18, 14, 20, 16]
            },
            {
                label: 'Décaissements',
                backgroundColor: '#22c55e',
                data: [10, 12, 15, 11, 17, 14]
            }
        ]
    };

    const chartOptions = {
        plugins: {
            legend: {
                position: 'bottom'
            }
        }
    };

    return (
        <div className="card">
            <Toast ref={toast} />

            <div className="flex flex-wrap gap-2 align-items-center justify-content-between mb-4">
                <h4 className="m-0">
                    <i className="pi pi-chart-pie mr-2"></i>
                    Synthèse du Portefeuille Crédit
                </h4>
            </div>

            {/* Filters */}
            <div className="surface-100 p-3 border-round mb-4">
                <h5 className="mb-3"><i className="pi pi-filter mr-2"></i>Filtres</h5>
                <div className="grid">
                    <div className="col-12 md:col-6">
                        <label className="font-semibold block mb-2">Période</label>
                        <Calendar
                            value={dateRange}
                            onChange={(e) => setDateRange(e.value as Date[])}
                            selectionMode="range"
                            readOnlyInput
                            placeholder="Sélectionner une période"
                            dateFormat="dd/mm/yy"
                            showIcon
                            showButtonBar
                            className="w-full"
                        />
                    </div>
                    <div className="col-12 md:col-6">
                        <label className="font-semibold block mb-2">Agence</label>
                        <Dropdown
                            value={branchFilter}
                            options={branches}
                            onChange={(e) => setBranchFilter(e.value)}
                            optionLabel="name"
                            optionValue="id"
                            placeholder="Toutes les agences"
                            className="w-full"
                            showClear
                            filter
                        />
                    </div>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid mb-4">
                <div className="col-12 md:col-6 lg:col-3">
                    <Card className="h-full">
                        <div className="flex align-items-center gap-3">
                            <div className="flex align-items-center justify-content-center bg-blue-100 border-round" style={{ width: '3rem', height: '3rem' }}>
                                <i className="pi pi-file-edit text-blue-500 text-xl"></i>
                            </div>
                            <div>
                                <p className="text-500 m-0 text-sm">Total Demandes</p>
                                <p className="text-2xl font-bold m-0">{totalDemandes}</p>
                            </div>
                        </div>
                    </Card>
                </div>
                <div className="col-12 md:col-6 lg:col-3">
                    <Card className="h-full">
                        <div className="flex align-items-center gap-3">
                            <div className="flex align-items-center justify-content-center bg-purple-100 border-round" style={{ width: '3rem', height: '3rem' }}>
                                <i className="pi pi-wallet text-purple-500 text-xl"></i>
                            </div>
                            <div>
                                <p className="text-500 m-0 text-sm">Montant Demandé</p>
                                <p className="text-xl font-bold m-0">{formatCurrency(totalMontantDemande)}</p>
                            </div>
                        </div>
                    </Card>
                </div>
                <div className="col-12 md:col-6 lg:col-3">
                    <Card className="h-full">
                        <div className="flex align-items-center gap-3">
                            <div className="flex align-items-center justify-content-center bg-green-100 border-round" style={{ width: '3rem', height: '3rem' }}>
                                <i className="pi pi-money-bill text-green-500 text-xl"></i>
                            </div>
                            <div>
                                <p className="text-500 m-0 text-sm">Total Décaissé</p>
                                <p className="text-xl font-bold m-0">{formatCurrency(totalDecaisse)}</p>
                            </div>
                        </div>
                    </Card>
                </div>
                <div className="col-12 md:col-6 lg:col-3">
                    <Card className="h-full">
                        <div className="flex align-items-center gap-3">
                            <div className="flex align-items-center justify-content-center bg-orange-100 border-round" style={{ width: '3rem', height: '3rem' }}>
                                <i className="pi pi-percentage text-orange-500 text-xl"></i>
                            </div>
                            <div>
                                <p className="text-500 m-0 text-sm">Taux d'Approbation</p>
                                <p className="text-2xl font-bold m-0">{tauxApprobation}%</p>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>

            {/* Detailed Stats */}
            <div className="grid mb-4">
                <div className="col-12 md:col-4">
                    <div className="surface-100 p-3 border-round h-full">
                        <h6 className="mt-0 mb-3">Statut des Demandes</h6>
                        <div className="flex flex-column gap-2">
                            <div className="flex justify-content-between">
                                <span><Tag value="Approuvées" severity="success" /></span>
                                <span className="font-bold">{approuvees}</span>
                            </div>
                            <div className="flex justify-content-between">
                                <span><Tag value="Rejetées" severity="danger" /></span>
                                <span className="font-bold">{rejetees}</span>
                            </div>
                            <div className="flex justify-content-between">
                                <span><Tag value="En Cours" severity="warning" /></span>
                                <span className="font-bold">{enCours}</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-12 md:col-4">
                    <div className="surface-100 p-3 border-round h-full">
                        <h6 className="mt-0 mb-3">Décaissements</h6>
                        <div className="flex flex-column gap-2">
                            <div className="flex justify-content-between">
                                <span>Nombre</span>
                                <span className="font-bold">{nombreDecaissements}</span>
                            </div>
                            <div className="flex justify-content-between">
                                <span>Montant Total</span>
                                <span className="font-bold">{formatCurrency(totalDecaisse)}</span>
                            </div>
                            <div className="flex justify-content-between">
                                <span>Montant Moyen</span>
                                <span className="font-bold">{formatCurrency(nombreDecaissements > 0 ? totalDecaisse / nombreDecaissements : 0)}</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-12 md:col-4">
                    <div className="surface-100 p-3 border-round h-full">
                        <h6 className="mt-0 mb-3">Indicateurs Clés</h6>
                        <div className="flex flex-column gap-2">
                            <div className="flex justify-content-between">
                                <span>Taux de Transformation</span>
                                <span className="font-bold">{totalDemandes > 0 ? ((nombreDecaissements / totalDemandes) * 100).toFixed(1) : '0'}%</span>
                            </div>
                            <div className="flex justify-content-between">
                                <span>Taux de Rejet</span>
                                <span className="font-bold">{totalDemandes > 0 ? ((rejetees / totalDemandes) * 100).toFixed(1) : '0'}%</span>
                            </div>
                            <div className="flex justify-content-between">
                                <span>Montant Moyen Demandé</span>
                                <span className="font-bold">{formatCurrency(totalDemandes > 0 ? totalMontantDemande / totalDemandes : 0)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts */}
            <div className="grid">
                <div className="col-12 md:col-6">
                    <Card title="Répartition des Demandes">
                        <Chart type="doughnut" data={statusChartData} options={chartOptions} style={{ height: '300px' }} />
                    </Card>
                </div>
                <div className="col-12 md:col-6">
                    <Card title="Évolution Mensuelle">
                        <Chart type="bar" data={monthlyTrendData} options={chartOptions} style={{ height: '300px' }} />
                    </Card>
                </div>
            </div>
        </div>
    );
}
