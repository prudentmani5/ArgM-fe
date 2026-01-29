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
import useConsumApi from '../../../../../hooks/fetchData/useConsumApi';
import { buildApiUrl } from '../../../../../utils/apiConfig';

interface RapportContentieux {
    id?: number;
    dossierNumber?: string;
    creditNumber?: string;
    clientName?: string;
    totalAmount?: number;
    recoveredAmount?: number;
    pendingAmount?: number;
    filingDate?: string;
    courtName?: string;
    lawyerName?: string;
    nextHearingDate?: string;
    status?: string;
    requiresDGApproval?: boolean;
    dgApprovalStatus?: string;
}

const STATUTS_CONTENTIEUX = [
    { label: 'Tous', value: null },
    { label: 'En préparation', value: 'PREPARATION' },
    { label: 'Déposé', value: 'FILED' },
    { label: 'En cours', value: 'IN_PROGRESS' },
    { label: 'Jugement rendu', value: 'JUDGMENT' },
    { label: 'Exécution', value: 'EXECUTION' },
    { label: 'Clôturé', value: 'CLOSED' }
];

export default function RapportContentieuxPage() {
    const [dossiers, setDossiers] = useState<RapportContentieux[]>([]);
    const [dateDebut, setDateDebut] = useState<Date | null>(null);
    const [dateFin, setDateFin] = useState<Date | null>(null);
    const [statut, setStatut] = useState<string | null>(null);
    const [stats, setStats] = useState({ total: 0, totalAmount: 0, recovered: 0, pending: 0, awaitingDG: 0 });
    const toast = useRef<Toast>(null);

    const { data, loading, error, fetchData, callType } = useConsumApi('');
    const BASE_URL = buildApiUrl('/api/remboursement/reports/litigation');

    useEffect(() => {
        if (data && callType === 'search') {
            setDossiers(Array.isArray(data) ? data : data.content || []);
            calculateStats(Array.isArray(data) ? data : data.content || []);
        }
        if (error) {
            toast.current?.show({ severity: 'error', summary: 'Erreur', detail: error.message || 'Une erreur est survenue', life: 3000 });
        }
    }, [data, error, callType]);

    const calculateStats = (data: RapportContentieux[]) => {
        setStats({
            total: data.length,
            totalAmount: data.reduce((acc, item) => acc + (item.totalAmount || 0), 0),
            recovered: data.reduce((acc, item) => acc + (item.recoveredAmount || 0), 0),
            pending: data.reduce((acc, item) => acc + (item.pendingAmount || 0), 0),
            awaitingDG: data.filter(d => d.requiresDGApproval && d.dgApprovalStatus === 'PENDING').length
        });
    };

    const handleSearch = () => {
        const params = new URLSearchParams();
        if (dateDebut) params.append('dateDebut', dateDebut.toISOString().split('T')[0]);
        if (dateFin) params.append('dateFin', dateFin.toISOString().split('T')[0]);
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

    const statusBodyTemplate = (rowData: RapportContentieux) => {
        const statusLabels: { [key: string]: string } = {
            'PREPARATION': 'En préparation',
            'FILED': 'Déposé',
            'IN_PROGRESS': 'En cours',
            'JUDGMENT': 'Jugement',
            'EXECUTION': 'Exécution',
            'CLOSED': 'Clôturé'
        };
        const severities: { [key: string]: 'success' | 'warning' | 'danger' | 'info' | 'secondary' } = {
            'PREPARATION': 'secondary',
            'FILED': 'info',
            'IN_PROGRESS': 'warning',
            'JUDGMENT': 'info',
            'EXECUTION': 'warning',
            'CLOSED': 'success'
        };
        return <Tag value={statusLabels[rowData.status || ''] || rowData.status} severity={severities[rowData.status || ''] || 'secondary'} />;
    };

    const dgApprovalBodyTemplate = (rowData: RapportContentieux) => {
        if (!rowData.requiresDGApproval) {
            return <Tag value="Non requis" severity="secondary" />;
        }
        const statusLabels: { [key: string]: string } = {
            'PENDING': 'En attente',
            'APPROVED': 'Approuvé',
            'REJECTED': 'Rejeté'
        };
        const severities: { [key: string]: 'success' | 'warning' | 'danger' } = {
            'PENDING': 'warning',
            'APPROVED': 'success',
            'REJECTED': 'danger'
        };
        return (
            <Tag
                value={statusLabels[rowData.dgApprovalStatus || ''] || rowData.dgApprovalStatus}
                severity={severities[rowData.dgApprovalStatus || ''] || 'secondary'}
                icon={rowData.dgApprovalStatus === 'PENDING' ? 'pi pi-clock' : undefined}
            />
        );
    };

    const amountBodyTemplate = (rowData: RapportContentieux, field: string) => {
        return formatCurrency((rowData as any)[field]);
    };

    const header = (
        <div className="flex flex-wrap gap-2 align-items-center justify-content-between">
            <h4 className="m-0">Dossiers Contentieux</h4>
            <Button label="Exporter" icon="pi pi-download" severity="help" onClick={handleExport} />
        </div>
    );

    return (
        <div className="card">
            <Toast ref={toast} />

            <h2 className="mb-4">
                <i className="pi pi-briefcase mr-2"></i>
                Rapport des Dossiers Contentieux
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
                    <div className="col-12 md:col-3">
                        <div className="field">
                            <label htmlFor="statut" className="font-semibold">Statut</label>
                            <Dropdown
                                id="statut"
                                value={statut}
                                options={STATUTS_CONTENTIEUX}
                                onChange={(e) => setStatut(e.value)}
                                className="w-full"
                                placeholder="Tous les statuts"
                            />
                        </div>
                    </div>
                    <div className="col-12 md:col-3 flex align-items-end">
                        <Button label="Rechercher" icon="pi pi-search" onClick={handleSearch} className="w-full" />
                    </div>
                </div>
            </Card>

            <div className="grid mb-4">
                <div className="col-12 md:col-3">
                    <Card className="bg-red-100">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-red-700">{stats.total}</div>
                            <div className="text-500">Dossiers Contentieux</div>
                        </div>
                    </Card>
                </div>
                <div className="col-12 md:col-3">
                    <Card className="bg-orange-100">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-orange-700">{formatCurrency(stats.totalAmount)}</div>
                            <div className="text-500">Montant Total</div>
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
                    <Card className="bg-yellow-100">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-yellow-700">{stats.awaitingDG}</div>
                            <div className="text-500">En attente Approbation DG</div>
                        </div>
                    </Card>
                </div>
            </div>

            <div className="surface-100 p-3 border-round mb-4">
                <p className="m-0">
                    <i className="pi pi-info-circle mr-2"></i>
                    <strong>Rappel:</strong> Tout dossier contentieux supérieur à 500 000 FBU nécessite l'approbation du Directeur Général.
                </p>
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
                <Column field="totalAmount" header="Montant" body={(row) => amountBodyTemplate(row, 'totalAmount')} sortable />
                <Column field="recoveredAmount" header="Recouvré" body={(row) => amountBodyTemplate(row, 'recoveredAmount')} />
                <Column field="filingDate" header="Date Dépôt" body={(row) => formatDate(row.filingDate)} sortable />
                <Column field="courtName" header="Tribunal" />
                <Column field="status" header="Statut" body={statusBodyTemplate} sortable />
                <Column field="dgApprovalStatus" header="Approbation DG" body={dgApprovalBodyTemplate} />
            </DataTable>
        </div>
    );
}
