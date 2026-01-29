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
import { Chart } from 'primereact/chart';
import useConsumApi from '../../../../../hooks/fetchData/useConsumApi';
import { buildApiUrl } from '../../../../../utils/apiConfig';

interface RapportRecouvrement {
    id?: number;
    dossierNumber?: string;
    creditNumber?: string;
    clientName?: string;
    phase?: string;
    etape?: string;
    amountDue?: number;
    amountRecovered?: number;
    recoveryRate?: number;
    agentName?: string;
    lastActionDate?: string;
    nextActionDate?: string;
    status?: string;
}

const PHASES = [
    { label: 'Toutes', value: null },
    { label: 'Phase Amiable', value: 'AMIABLE' },
    { label: 'Phase Relance', value: 'RELANCE' },
    { label: 'Phase Contentieux', value: 'CONTENTIEUX' }
];

const STATUTS = [
    { label: 'Tous', value: null },
    { label: 'En cours', value: 'IN_PROGRESS' },
    { label: 'Résolu', value: 'RESOLVED' },
    { label: 'Escaladé', value: 'ESCALATED' }
];

export default function RapportRecouvrementPage() {
    const [dossiers, setDossiers] = useState<RapportRecouvrement[]>([]);
    const [dateDebut, setDateDebut] = useState<Date | null>(null);
    const [dateFin, setDateFin] = useState<Date | null>(null);
    const [phase, setPhase] = useState<string | null>(null);
    const [statut, setStatut] = useState<string | null>(null);
    const [stats, setStats] = useState({ total: 0, recovered: 0, inProgress: 0, resolved: 0, rate: 0 });
    const [chartData, setChartData] = useState({});
    const toast = useRef<Toast>(null);

    const { data, loading, error, fetchData, callType } = useConsumApi('');
    const BASE_URL = buildApiUrl('/api/remboursement/reports/recovery');

    useEffect(() => {
        if (data && callType === 'search') {
            setDossiers(Array.isArray(data) ? data : data.content || []);
            calculateStats(Array.isArray(data) ? data : data.content || []);
        }
        if (error) {
            toast.current?.show({ severity: 'error', summary: 'Erreur', detail: error.message || 'Une erreur est survenue', life: 3000 });
        }
    }, [data, error, callType]);

    const calculateStats = (data: RapportRecouvrement[]) => {
        const totalDue = data.reduce((acc, item) => acc + (item.amountDue || 0), 0);
        const totalRecovered = data.reduce((acc, item) => acc + (item.amountRecovered || 0), 0);
        const inProgress = data.filter(d => d.status === 'IN_PROGRESS').length;
        const resolved = data.filter(d => d.status === 'RESOLVED').length;
        const rate = totalDue > 0 ? Math.round((totalRecovered / totalDue) * 100) : 0;

        setStats({ total: data.length, recovered: totalRecovered, inProgress, resolved, rate });

        // Chart data
        const phaseCount = {
            'AMIABLE': data.filter(d => d.phase === 'AMIABLE').length,
            'RELANCE': data.filter(d => d.phase === 'RELANCE').length,
            'CONTENTIEUX': data.filter(d => d.phase === 'CONTENTIEUX').length
        };

        setChartData({
            labels: ['Phase Amiable', 'Phase Relance', 'Phase Contentieux'],
            datasets: [{
                data: [phaseCount.AMIABLE, phaseCount.RELANCE, phaseCount.CONTENTIEUX],
                backgroundColor: ['#22c55e', '#f59e0b', '#ef4444']
            }]
        });
    };

    const handleSearch = () => {
        const params = new URLSearchParams();
        if (dateDebut) params.append('dateDebut', dateDebut.toISOString().split('T')[0]);
        if (dateFin) params.append('dateFin', dateFin.toISOString().split('T')[0]);
        if (phase) params.append('phase', phase);
        if (statut) params.append('statut', statut);

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

    const phaseBodyTemplate = (rowData: RapportRecouvrement) => {
        const phaseLabels: { [key: string]: string } = {
            'AMIABLE': 'Amiable',
            'RELANCE': 'Relance',
            'CONTENTIEUX': 'Contentieux'
        };
        const severities: { [key: string]: 'success' | 'warning' | 'danger' } = {
            'AMIABLE': 'success',
            'RELANCE': 'warning',
            'CONTENTIEUX': 'danger'
        };
        return <Tag value={phaseLabels[rowData.phase || ''] || rowData.phase} severity={severities[rowData.phase || ''] || 'info'} />;
    };

    const statusBodyTemplate = (rowData: RapportRecouvrement) => {
        const statusLabels: { [key: string]: string } = {
            'IN_PROGRESS': 'En cours',
            'RESOLVED': 'Résolu',
            'ESCALATED': 'Escaladé'
        };
        const severities: { [key: string]: 'success' | 'warning' | 'danger' | 'info' } = {
            'IN_PROGRESS': 'info',
            'RESOLVED': 'success',
            'ESCALATED': 'danger'
        };
        return <Tag value={statusLabels[rowData.status || ''] || rowData.status} severity={severities[rowData.status || ''] || 'secondary'} />;
    };

    const rateBodyTemplate = (rowData: RapportRecouvrement) => {
        const rate = rowData.recoveryRate || 0;
        return (
            <div className="flex align-items-center gap-2">
                <span>{rate}%</span>
                <div className="w-4rem h-0.5rem bg-gray-200 border-round">
                    <div
                        className={`h-full border-round ${rate >= 75 ? 'bg-green-500' : rate >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                        style={{ width: `${rate}%` }}
                    />
                </div>
            </div>
        );
    };

    const header = (
        <div className="flex flex-wrap gap-2 align-items-center justify-content-between">
            <h4 className="m-0">Dossiers de Recouvrement</h4>
            <Button label="Exporter" icon="pi pi-download" severity="help" onClick={handleExport} />
        </div>
    );

    return (
        <div className="card">
            <Toast ref={toast} />

            <h2 className="mb-4">
                <i className="pi pi-users mr-2"></i>
                Rapport de Recouvrement
            </h2>

            <Card className="mb-4">
                <div className="grid">
                    <div className="col-12 md:col-3">
                        <div className="field">
                            <label htmlFor="dateDebut" className="font-semibold">Date Début</label>
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
                    <div className="col-12 md:col-3">
                        <div className="field">
                            <label htmlFor="dateFin" className="font-semibold">Date Fin</label>
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
                    <div className="col-12 md:col-2">
                        <div className="field">
                            <label htmlFor="phase" className="font-semibold">Phase</label>
                            <Dropdown
                                id="phase"
                                value={phase}
                                options={PHASES}
                                onChange={(e) => setPhase(e.value)}
                                className="w-full"
                                placeholder="Toutes"
                            />
                        </div>
                    </div>
                    <div className="col-12 md:col-2">
                        <div className="field">
                            <label htmlFor="statut" className="font-semibold">Statut</label>
                            <Dropdown
                                id="statut"
                                value={statut}
                                options={STATUTS}
                                onChange={(e) => setStatut(e.value)}
                                className="w-full"
                                placeholder="Tous"
                            />
                        </div>
                    </div>
                    <div className="col-12 md:col-2 flex align-items-end">
                        <Button label="Rechercher" icon="pi pi-search" onClick={handleSearch} className="w-full" />
                    </div>
                </div>
            </Card>

            <div className="grid mb-4">
                <div className="col-12 md:col-3">
                    <Card className="bg-blue-100">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-blue-700">{stats.total}</div>
                            <div className="text-500">Total Dossiers</div>
                        </div>
                    </Card>
                </div>
                <div className="col-12 md:col-3">
                    <Card className="bg-green-100">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-green-700">{formatCurrency(stats.recovered)}</div>
                            <div className="text-500">Montant Recouvré</div>
                        </div>
                    </Card>
                </div>
                <div className="col-12 md:col-3">
                    <Card className="bg-orange-100">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-orange-700">{stats.inProgress}</div>
                            <div className="text-500">En Cours</div>
                        </div>
                    </Card>
                </div>
                <div className="col-12 md:col-3">
                    <Card className="bg-purple-100">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-purple-700">{stats.rate}%</div>
                            <div className="text-500">Taux de Recouvrement</div>
                        </div>
                    </Card>
                </div>
            </div>

            <DataTable
                value={dossiers}
                loading={loading && callType === 'search'}
                paginator
                rows={10}
                emptyMessage="Aucun dossier trouvé. Veuillez effectuer une recherche."
                stripedRows
                header={header}
            >
                <Column field="dossierNumber" header="N° Dossier" sortable />
                <Column field="creditNumber" header="N° Crédit" sortable />
                <Column field="clientName" header="Client" sortable />
                <Column field="phase" header="Phase" body={phaseBodyTemplate} sortable />
                <Column field="etape" header="Étape" />
                <Column field="amountDue" header="Montant Dû" body={(row) => formatCurrency(row.amountDue)} sortable />
                <Column field="recoveryRate" header="Taux" body={rateBodyTemplate} sortable />
                <Column field="agentName" header="Agent" />
                <Column field="status" header="Statut" body={statusBodyTemplate} />
            </DataTable>
        </div>
    );
}
