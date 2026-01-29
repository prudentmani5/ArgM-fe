'use client';

import React, { useState, useEffect, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { Tag } from 'primereact/tag';
import { InputText } from 'primereact/inputtext';
import { useRouter, useSearchParams } from 'next/navigation';
import { buildApiUrl } from '@/utils/apiConfig';
import useConsumApi from '@/hooks/fetchData/useConsumApi';

const BASE_URL = buildApiUrl('/api/credit/field-visits');

export default function VisitesListPage() {
    const [visites, setVisites] = useState<any[]>([]);
    const [globalFilter, setGlobalFilter] = useState('');
    const toast = useRef<Toast>(null);
    const router = useRouter();
    const searchParams = useSearchParams();
    const statusFilter = searchParams.get('status');

    const { data, loading, error, fetchData, callType } = useConsumApi('');

    useEffect(() => {
        loadVisites();
    }, []);

    useEffect(() => {
        if (data && callType === 'loadVisites') {
            let list = Array.isArray(data) ? data : data.content || [];
            if (statusFilter) {
                list = list.filter((v: any) => v.statusCode === statusFilter);
            }
            setVisites(list);
        }
        if (error) {
            toast.current?.show({ severity: 'error', summary: 'Erreur', detail: error.message, life: 3000 });
        }
    }, [data, error, callType, statusFilter]);

    const loadVisites = () => {
        fetchData(null, 'GET', `${BASE_URL}/findall`, 'loadVisites');
    };

    const goToVisit = (rowData: any) => {
        router.push(`/credit/visites/${rowData.applicationId}`);
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('fr-FR');
    };

    const formatDateTime = (dateString: string) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleString('fr-FR');
    };

    const statusBodyTemplate = (rowData: any) => {
        const statusColors: Record<string, string> = {
            'PLANIFIEE': 'info',
            'EN_COURS': 'warning',
            'EFFECTUEE': 'success',
            'ANNULEE': 'danger'
        };
        return <Tag value={rowData.statusName || rowData.statusCode || 'Planifiée'} severity={statusColors[rowData.statusCode] as any || 'info'} />;
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

    const actionsBodyTemplate = (rowData: any) => (
        <div className="flex gap-2">
            <Button
                icon="pi pi-map-marker"
                rounded
                text
                severity="info"
                onClick={() => goToVisit(rowData)}
                tooltip="Voir/Modifier la Visite"
            />
        </div>
    );

    const header = (
        <div className="flex flex-wrap gap-2 align-items-center justify-content-between">
            <h5 className="m-0">
                <i className="pi pi-map-marker mr-2"></i>
                {statusFilter === 'EFFECTUEE' ? 'Visites Effectuées' : 'Visites Terrain Planifiées'}
            </h5>
            <span className="p-input-icon-left">
                <i className="pi pi-search" />
                <InputText
                    value={globalFilter}
                    onChange={(e) => setGlobalFilter(e.target.value)}
                    placeholder="Rechercher..."
                />
            </span>
        </div>
    );

    return (
        <div className="card">
            <Toast ref={toast} />

            <DataTable
                value={visites}
                paginator
                rows={10}
                rowsPerPageOptions={[5, 10, 25, 50]}
                loading={loading}
                globalFilter={globalFilter}
                header={header}
                emptyMessage="Aucune visite trouvée"
                className="p-datatable-sm"
            >
                <Column field="applicationNumber" header="N° Dossier" sortable filter />
                <Column field="clientName" header="Client" sortable filter />
                <Column field="plannedDate" header="Date Planifiée" body={(row) => formatDateTime(row.plannedDate)} sortable />
                <Column field="actualDate" header="Date Effective" body={(row) => formatDate(row.actualDate)} sortable />
                <Column header="Statut" body={statusBodyTemplate} />
                <Column header="Recommandation" body={recommendationTemplate} />
                <Column field="visitedByName" header="Agent" sortable filter />
                <Column header="Actions" body={actionsBodyTemplate} style={{ width: '100px' }} />
            </DataTable>
        </div>
    );
}
