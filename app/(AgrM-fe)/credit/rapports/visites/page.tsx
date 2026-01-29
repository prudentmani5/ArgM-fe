'use client';

import React, { useState, useEffect, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { Tag } from 'primereact/tag';
import { Calendar } from 'primereact/calendar';
import { buildApiUrl } from '@/utils/apiConfig';
import useConsumApi from '@/hooks/fetchData/useConsumApi';

const BASE_URL = buildApiUrl('/api/credit/field-visits');

export default function RapportVisitesPage() {
    const [visites, setVisites] = useState<any[]>([]);
    const [dateRange, setDateRange] = useState<Date[] | null>(null);
    const toast = useRef<Toast>(null);
    const dt = useRef<DataTable<any[]>>(null);

    const { data, loading, error, fetchData, callType } = useConsumApi('');

    useEffect(() => {
        loadVisites();
    }, []);

    useEffect(() => {
        if (data && callType === 'loadVisites') {
            setVisites(Array.isArray(data) ? data : data.content || []);
        }
        if (error) {
            toast.current?.show({ severity: 'error', summary: 'Erreur', detail: error.message, life: 3000 });
        }
    }, [data, error, callType]);

    const loadVisites = () => {
        fetchData(null, 'GET', `${BASE_URL}/findall`, 'loadVisites');
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('fr-FR');
    };

    const exportCSV = () => {
        dt.current?.exportCSV();
    };

    const statusBodyTemplate = (rowData: any) => {
        const colors: Record<string, string> = {
            'PLANIFIEE': 'info',
            'EN_COURS': 'warning',
            'EFFECTUEE': 'success',
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

    // Filter by date range
    const filteredVisites = visites.filter((v: any) => {
        if (!dateRange || !dateRange[0]) return true;
        const visitDate = new Date(v.plannedDate || v.actualDate);
        if (dateRange[1]) {
            return visitDate >= dateRange[0] && visitDate <= dateRange[1];
        }
        return visitDate >= dateRange[0];
    });

    // Calculate statistics
    const effectuees = filteredVisites.filter(v => v.statusCode === 'EFFECTUEE').length;
    const planifiees = filteredVisites.filter(v => v.statusCode === 'PLANIFIEE').length;
    const favorables = filteredVisites.filter(v => v.recommendationCode === 'FAVORABLE').length;
    const defavorables = filteredVisites.filter(v => v.recommendationCode === 'DEFAVORABLE').length;

    const header = (
        <div className="flex flex-wrap gap-2 align-items-center justify-content-between">
            <h5 className="m-0">
                <i className="pi pi-map mr-2"></i>
                Rapport des Visites Terrain
            </h5>
            <div className="flex gap-2 align-items-center">
                <Calendar
                    value={dateRange}
                    onChange={(e) => setDateRange(e.value as Date[])}
                    selectionMode="range"
                    placeholder="Période"
                    dateFormat="dd/mm/yy"
                    showIcon
                    className="w-15rem"
                />
                <Button label="Exporter" icon="pi pi-file-excel" severity="success" onClick={exportCSV} />
            </div>
        </div>
    );

    return (
        <div className="card">
            <Toast ref={toast} />

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
                loading={loading}
                header={header}
                emptyMessage="Aucune visite trouvée"
                className="p-datatable-sm"
                exportFilename="rapport_visites_terrain"
            >
                <Column field="applicationNumber" header="N° Dossier" sortable />
                <Column field="clientName" header="Client" sortable />
                <Column field="plannedDate" header="Date Planifiée" body={(row) => formatDate(row.plannedDate)} sortable />
                <Column field="actualDate" header="Date Effective" body={(row) => formatDate(row.actualDate)} sortable />
                <Column header="Statut" body={statusBodyTemplate} />
                <Column header="Recommandation" body={recommendationTemplate} />
                <Column field="visitedByName" header="Agent" sortable />
                <Column field="branchName" header="Agence" sortable />
            </DataTable>
        </div>
    );
}
