'use client';

import React, { useState, useEffect, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { Tag } from 'primereact/tag';
import { Calendar } from 'primereact/calendar';
import { Dropdown } from 'primereact/dropdown';
import { buildApiUrl } from '@/utils/apiConfig';
import useConsumApi from '@/hooks/fetchData/useConsumApi';
import { exportToPDF, formatDate as formatDatePDF } from '@/utils/pdfExport';

const BASE_URL = buildApiUrl('/api/credit/field-visits');

const visitStatuses = [
    { code: 'PLANNED', name: 'Planifiée' },
    { code: 'IN_PROGRESS', name: 'En cours' },
    { code: 'COMPLETED', name: 'Effectuée' },
    { code: 'CANCELLED', name: 'Annulée' }
];

export default function RapportVisitesPage() {
    const [visites, setVisites] = useState<any[]>([]);
    const [branches, setBranches] = useState<any[]>([]);
    const [filters, setFilters] = useState<any>({
        dateRange: null,
        branchId: null,
        statusCode: null
    });
    const toast = useRef<Toast>(null);
    const dt = useRef<DataTable<any[]>>(null);

    // Separate hook instances for each data type
    const visitesApi = useConsumApi('');
    const branchesApi = useConsumApi('');

    useEffect(() => {
        loadVisites();
        loadBranches();
    }, []);

    // Handle visites data
    useEffect(() => {
        if (visitesApi.data) {
            const rawData = Array.isArray(visitesApi.data) ? visitesApi.data : visitesApi.data.content || [];
            // Map backend fields to frontend expected fields
            const mappedData = rawData.map((item: any) => ({
                ...item,
                applicationNumber: item.application?.applicationNumber || '-',
                clientName: item.application?.client
                    ? `${item.application.client.firstName || ''} ${item.application.client.lastName || ''}`.trim()
                    : '-',
                plannedDate: item.scheduledDate,
                statusCode: item.visitStatus,
                statusName: getStatusName(item.visitStatus),
                recommendationCode: item.recommendation?.code,
                recommendationName: item.recommendation?.nameFr || item.recommendation?.name,
                visitedByName: item.assignedAgent
                    ? `${item.assignedAgent.firstName || ''} ${item.assignedAgent.lastName || ''}`.trim()
                    : '-',
                branchName: item.application?.branch?.name || '-',
                branchId: item.application?.branch?.id
            }));
            setVisites(mappedData);
        }
        if (visitesApi.error) {
            toast.current?.show({ severity: 'error', summary: 'Erreur', detail: visitesApi.error.message, life: 3000 });
        }
    }, [visitesApi.data, visitesApi.error]);

    // Get status display name
    const getStatusName = (statusCode: string): string => {
        const statusMap: Record<string, string> = {
            'PLANNED': 'Planifiée',
            'PLANIFIEE': 'Planifiée',
            'IN_PROGRESS': 'En cours',
            'EN_COURS': 'En cours',
            'COMPLETED': 'Effectuée',
            'EFFECTUEE': 'Effectuée',
            'CANCELLED': 'Annulée',
            'ANNULEE': 'Annulée'
        };
        return statusMap[statusCode] || statusCode || 'Planifiée';
    };

    // Handle branches data
    useEffect(() => {
        if (branchesApi.data) {
            setBranches(Array.isArray(branchesApi.data) ? branchesApi.data : branchesApi.data.content || []);
        }
    }, [branchesApi.data]);

    const loadVisites = () => {
        visitesApi.fetchData(null, 'GET', `${BASE_URL}/findall`, 'loadVisites');
    };

    const loadBranches = () => {
        branchesApi.fetchData(null, 'GET', buildApiUrl('/api/reference-data/branches/findall'), 'loadBranches');
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('fr-FR');
    };

    const exportCSV = () => {
        dt.current?.exportCSV();
    };

    const exportPdf = () => {
        exportToPDF({
            title: 'Rapport des Visites Terrain',
            columns: [
                { header: 'N° Dossier', dataKey: 'applicationNumber' },
                { header: 'Client', dataKey: 'clientName' },
                { header: 'Date Planifiée', dataKey: 'plannedDate', formatter: formatDatePDF },
                { header: 'Date Effective', dataKey: 'actualDate', formatter: formatDatePDF },
                { header: 'Statut', dataKey: 'statusName' },
                { header: 'Recommandation', dataKey: 'recommendationName' },
                { header: 'Agent', dataKey: 'visitedByName' },
                { header: 'Agence', dataKey: 'branchName' },
                { header: 'Responsable', dataKey: 'userAction' }
            ],
            data: filteredVisites,
            filename: 'rapport_visites_terrain.pdf',
            orientation: 'landscape',
            statistics: [
                { label: 'Total Visites', value: filteredVisites.length },
                { label: 'Effectuées', value: effectuees },
                { label: 'Planifiées', value: planifiees },
                { label: 'Favorables', value: favorables }
            ]
        });
    };

    const statusBodyTemplate = (rowData: any) => {
        const colors: Record<string, string> = {
            'PLANNED': 'info',
            'PLANIFIEE': 'info',
            'IN_PROGRESS': 'warning',
            'EN_COURS': 'warning',
            'COMPLETED': 'success',
            'EFFECTUEE': 'success',
            'CANCELLED': 'danger',
            'ANNULEE': 'danger'
        };
        return <Tag value={rowData.statusName || rowData.statusCode || 'Planifiée'} severity={colors[rowData.statusCode] as any || 'info'} />;
    };

    const recommendationTemplate = (rowData: any) => {
        if (!rowData.recommendationCode) return <Tag value="En attente" severity="secondary" />;
        const colors: Record<string, string> = {
            'FAVORABLE': 'success',
            'FAVORABLE_AVEC_RESERVES': 'warning',
            'DEFAVORABLE': 'danger'
        };
        return <Tag value={rowData.recommendationName || rowData.recommendationCode} severity={colors[rowData.recommendationCode] as any || 'info'} />;
    };

    // Filter data based on filters
    const filteredVisites = visites.filter((v: any) => {
        let match = true;
        if (filters.branchId) {
            match = match && (v.branchId === filters.branchId || v.branch?.id === filters.branchId);
        }
        if (filters.statusCode) {
            match = match && v.statusCode === filters.statusCode;
        }
        if (filters.dateRange && filters.dateRange[0]) {
            const visitDate = new Date(v.plannedDate || v.actualDate);
            match = match && visitDate >= filters.dateRange[0];
            if (filters.dateRange[1]) {
                match = match && visitDate <= filters.dateRange[1];
            }
        }
        return match;
    });

    // Calculate statistics
    const effectuees = filteredVisites.filter(v => v.statusCode === 'COMPLETED' || v.statusCode === 'EFFECTUEE').length;
    const planifiees = filteredVisites.filter(v => v.statusCode === 'PLANNED' || v.statusCode === 'PLANIFIEE').length;
    const favorables = filteredVisites.filter(v => v.recommendationCode === 'FAVORABLE').length;
    const defavorables = filteredVisites.filter(v => v.recommendationCode === 'DEFAVORABLE').length;

    const header = (
        <div className="flex flex-wrap gap-2 align-items-center justify-content-between">
            <h5 className="m-0">
                <i className="pi pi-map mr-2"></i>
                Rapport des Visites Terrain
            </h5>
            <div className="flex gap-2">
                <Button label="Exporter CSV" icon="pi pi-file-excel" severity="success" onClick={exportCSV} />
                <Button label="Exporter PDF" icon="pi pi-file-pdf" severity="danger" onClick={exportPdf} />
            </div>
        </div>
    );

    return (
        <div className="card">
            <Toast ref={toast} />

            {/* Filters */}
            <div className="surface-100 p-3 border-round mb-4">
                <h5 className="mb-3"><i className="pi pi-filter mr-2"></i>Filtres</h5>
                <div className="grid">
                    <div className="col-12 md:col-4">
                        <label className="font-semibold block mb-2">Période</label>
                        <Calendar
                            value={filters.dateRange}
                            onChange={(e) => setFilters({ ...filters, dateRange: e.value })}
                            selectionMode="range"
                            readOnlyInput
                            placeholder="Sélectionner une période"
                            dateFormat="dd/mm/yy"
                            showIcon
                            showButtonBar
                            className="w-full"
                        />
                    </div>
                    <div className="col-12 md:col-4">
                        <label className="font-semibold block mb-2">Agence</label>
                        <Dropdown
                            value={filters.branchId}
                            options={branches}
                            onChange={(e) => setFilters({ ...filters, branchId: e.value })}
                            optionLabel="name"
                            optionValue="id"
                            placeholder="Toutes les agences"
                            className="w-full"
                            showClear
                            filter
                        />
                    </div>
                    <div className="col-12 md:col-4">
                        <label className="font-semibold block mb-2">Statut</label>
                        <Dropdown
                            value={filters.statusCode}
                            options={visitStatuses}
                            onChange={(e) => setFilters({ ...filters, statusCode: e.value })}
                            optionLabel="name"
                            optionValue="code"
                            placeholder="Tous les statuts"
                            className="w-full"
                            showClear
                        />
                    </div>
                </div>
            </div>

            {/* Statistics */}
            <div className="grid mb-4">
                <div className="col-12 md:col-3">
                    <div className="surface-100 p-3 border-round text-center">
                        <p className="text-500 m-0">Total Visites</p>
                        <p className="text-2xl font-bold m-0">{filteredVisites.length}</p>
                    </div>
                </div>
                <div className="col-12 md:col-3">
                    <div className="bg-green-100 p-3 border-round text-center">
                        <p className="text-500 m-0">Effectuées</p>
                        <p className="text-2xl font-bold text-green-600 m-0">{effectuees}</p>
                    </div>
                </div>
                <div className="col-12 md:col-3">
                    <div className="bg-blue-100 p-3 border-round text-center">
                        <p className="text-500 m-0">Planifiées</p>
                        <p className="text-2xl font-bold text-blue-600 m-0">{planifiees}</p>
                    </div>
                </div>
                <div className="col-12 md:col-3">
                    <div className="surface-100 p-3 border-round text-center">
                        <p className="text-500 m-0">Taux Favorable</p>
                        <p className="text-2xl font-bold m-0">
                            {effectuees > 0 ? `${((favorables / effectuees) * 100).toFixed(0)}%` : '-'}
                        </p>
                    </div>
                </div>
            </div>

            <DataTable
                ref={dt}
                value={filteredVisites}
                paginator
                rows={10}
                rowsPerPageOptions={[5, 10, 25, 50]}
                loading={visitesApi.loading}
                header={header}
                emptyMessage="Aucune visite trouvée"
                className="p-datatable-sm"
                exportFilename="rapport_visites_terrain"
                sortField="plannedDate"
                sortOrder={-1}
            >
                <Column field="applicationNumber" header="N° Dossier" sortable />
                <Column field="clientName" header="Client" sortable />
                <Column field="plannedDate" header="Date Planifiée" body={(row) => formatDate(row.plannedDate)} sortable />
                <Column field="actualDate" header="Date Effective" body={(row) => formatDate(row.actualDate)} sortable />
                <Column field="userAction" header="Responsable" sortable />
                <Column header="Statut" body={statusBodyTemplate} />
                <Column header="Recommandation" body={recommendationTemplate} />
                <Column field="visitedByName" header="Agent" sortable />
                <Column field="branchName" header="Agence" sortable />
            </DataTable>
        </div>
    );
}
