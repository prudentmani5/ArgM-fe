'use client';

import React, { useState, useEffect, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Calendar } from 'primereact/calendar';
import { Dropdown } from 'primereact/dropdown';
import { Toast } from 'primereact/toast';
import { Card } from 'primereact/card';
import { Tag } from 'primereact/tag';
import { ProgressBar } from 'primereact/progressbar';
import useConsumApi from '../../../../../hooks/fetchData/useConsumApi';
import { buildApiUrl } from '../../../../../utils/apiConfig';

interface RapportRetard {
    id?: number;
    creditNumber?: string;
    clientName?: string;
    clientPhone?: string;
    dueDate?: string;
    daysOverdue?: number;
    amountDue?: number;
    penaltyAmount?: number;
    totalDue?: number;
    classification?: string;
    lastContactDate?: string;
    recoveryPhase?: string;
}

const CLASSIFICATIONS = [
    { label: 'Toutes', value: null },
    { label: 'Normal (1-30 jours)', value: 'NORMAL' },
    { label: 'À surveiller (31-60 jours)', value: 'WATCH' },
    { label: 'Douteux (61-90 jours)', value: 'DOUBTFUL' },
    { label: 'Contentieux (>90 jours)', value: 'LITIGATION' }
];

export default function RapportRetardsPage() {
    const [retards, setRetards] = useState<RapportRetard[]>([]);
    const [dateReference, setDateReference] = useState<Date | null>(new Date());
    const [classification, setClassification] = useState<string | null>(null);
    const [stats, setStats] = useState({ count: 0, totalDue: 0, totalPenalties: 0, avgDays: 0 });
    const toast = useRef<Toast>(null);

    const { data, loading, error, fetchData, callType } = useConsumApi('');
    const BASE_URL = buildApiUrl('/api/remboursement/reports/overdue');

    useEffect(() => {
        if (data && callType === 'search') {
            setRetards(Array.isArray(data) ? data : data.content || []);
            calculateStats(Array.isArray(data) ? data : data.content || []);
        }
        if (error) {
            toast.current?.show({ severity: 'error', summary: 'Erreur', detail: error.message || 'Une erreur est survenue', life: 3000 });
        }
    }, [data, error, callType]);

    const calculateStats = (data: RapportRetard[]) => {
        if (data.length === 0) {
            setStats({ count: 0, totalDue: 0, totalPenalties: 0, avgDays: 0 });
            return;
        }
        const stats = data.reduce((acc, item) => ({
            count: acc.count + 1,
            totalDue: acc.totalDue + (item.totalDue || 0),
            totalPenalties: acc.totalPenalties + (item.penaltyAmount || 0),
            avgDays: acc.avgDays + (item.daysOverdue || 0)
        }), { count: 0, totalDue: 0, totalPenalties: 0, avgDays: 0 });
        stats.avgDays = Math.round(stats.avgDays / data.length);
        setStats(stats);
    };

    const handleSearch = () => {
        const params = new URLSearchParams();
        if (dateReference) params.append('dateReference', dateReference.toISOString().split('T')[0]);
        if (classification) params.append('classification', classification);

        fetchData(null, 'GET', `${BASE_URL}?${params.toString()}`, 'search');
    };

    const handleExport = () => {
        toast.current?.show({ severity: 'info', summary: 'Export', detail: 'Export en cours...', life: 3000 });
    };

    const formatCurrency = (value: number | undefined) => {
        if (value === undefined || value === null) return '-';
        return new Intl.NumberFormat('fr-BI', { style: 'currency', currency: 'BIF' }).format(value);
    };

    const formatDate = (value: string | undefined) => {
        if (!value) return '-';
        return new Date(value).toLocaleDateString('fr-FR');
    };

    const daysBodyTemplate = (rowData: RapportRetard) => {
        const days = rowData.daysOverdue || 0;
        let severity: 'success' | 'warning' | 'danger' | 'info' = 'success';
        if (days > 90) severity = 'danger';
        else if (days > 60) severity = 'warning';
        else if (days > 30) severity = 'info';
        return <Tag value={`${days} jours`} severity={severity} />;
    };

    const classificationBodyTemplate = (rowData: RapportRetard) => {
        const classif = CLASSIFICATIONS.find(c => c.value === rowData.classification);
        let severity: 'success' | 'warning' | 'danger' | 'info' = 'success';
        switch (rowData.classification) {
            case 'LITIGATION': severity = 'danger'; break;
            case 'DOUBTFUL': severity = 'warning'; break;
            case 'WATCH': severity = 'info'; break;
            default: severity = 'success';
        }
        return <Tag value={classif?.label || rowData.classification} severity={severity} />;
    };

    const phaseBodyTemplate = (rowData: RapportRetard) => {
        const phases: { [key: string]: string } = {
            'AMIABLE': 'Amiable',
            'RELANCE': 'Relance',
            'CONTENTIEUX': 'Contentieux'
        };
        return phases[rowData.recoveryPhase || ''] || rowData.recoveryPhase || '-';
    };

    const header = (
        <div className="flex flex-wrap gap-2 align-items-center justify-content-between">
            <h4 className="m-0">Liste des Crédits en Retard</h4>
            <Button label="Exporter" icon="pi pi-download" severity="help" onClick={handleExport} />
        </div>
    );

    return (
        <div className="card">
            <Toast ref={toast} />

            <h2 className="mb-4">
                <i className="pi pi-exclamation-triangle mr-2"></i>
                Rapport des Retards de Paiement
            </h2>

            <Card className="mb-4">
                <div className="grid">
                    <div className="col-12 md:col-4">
                        <div className="field">
                            <label htmlFor="dateReference" className="font-semibold">Date de Référence</label>
                            <Calendar
                                id="dateReference"
                                value={dateReference}
                                onChange={(e) => setDateReference(e.value as Date)}
                                className="w-full"
                                dateFormat="dd/mm/yy"
                                showIcon
                            />
                        </div>
                    </div>
                    <div className="col-12 md:col-4">
                        <div className="field">
                            <label htmlFor="classification" className="font-semibold">Classification</label>
                            <Dropdown
                                id="classification"
                                value={classification}
                                options={CLASSIFICATIONS}
                                onChange={(e) => setClassification(e.value)}
                                className="w-full"
                                placeholder="Toutes les classifications"
                            />
                        </div>
                    </div>
                    <div className="col-12 md:col-4 flex align-items-end">
                        <Button label="Rechercher" icon="pi pi-search" onClick={handleSearch} className="w-full" />
                    </div>
                </div>
            </Card>

            <div className="grid mb-4">
                <div className="col-12 md:col-3">
                    <Card className="bg-red-100">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-red-700">{stats.count}</div>
                            <div className="text-500">Crédits en Retard</div>
                        </div>
                    </Card>
                </div>
                <div className="col-12 md:col-3">
                    <Card className="bg-orange-100">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-orange-700">{formatCurrency(stats.totalDue)}</div>
                            <div className="text-500">Total Impayés</div>
                        </div>
                    </Card>
                </div>
                <div className="col-12 md:col-3">
                    <Card className="bg-purple-100">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-purple-700">{formatCurrency(stats.totalPenalties)}</div>
                            <div className="text-500">Total Pénalités</div>
                        </div>
                    </Card>
                </div>
                <div className="col-12 md:col-3">
                    <Card className="bg-blue-100">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-blue-700">{stats.avgDays} jours</div>
                            <div className="text-500">Retard Moyen</div>
                        </div>
                    </Card>
                </div>
            </div>

            <DataTable
                value={retards}
                loading={loading && callType === 'search'}
                paginator
                rows={10}
                emptyMessage="Aucun retard trouvé. Veuillez effectuer une recherche."
                stripedRows
                header={header}
                sortField="daysOverdue"
                sortOrder={-1}
            >
                <Column field="creditNumber" header="N° Crédit" sortable />
                <Column field="clientName" header="Client" sortable />
                <Column field="clientPhone" header="Téléphone" />
                <Column field="dueDate" header="Date Échéance" body={(row) => formatDate(row.dueDate)} sortable />
                <Column field="daysOverdue" header="Jours Retard" body={daysBodyTemplate} sortable />
                <Column field="totalDue" header="Montant Dû" body={(row) => formatCurrency(row.totalDue)} sortable />
                <Column field="classification" header="Classification" body={classificationBodyTemplate} />
                <Column field="recoveryPhase" header="Phase" body={phaseBodyTemplate} />
            </DataTable>
        </div>
    );
}
