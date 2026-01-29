'use client';

import React, { useState, useEffect, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { Tag } from 'primereact/tag';
import { InputText } from 'primereact/inputtext';
import { useRouter } from 'next/navigation';
import { buildApiUrl } from '@/utils/apiConfig';
import useConsumApi from '@/hooks/fetchData/useConsumApi';

const BASE_URL = buildApiUrl('/api/credit/applications');

export default function AnalysesListPage() {
    const [demandes, setDemandes] = useState<any[]>([]);
    const [globalFilter, setGlobalFilter] = useState('');
    const toast = useRef<Toast>(null);
    const router = useRouter();

    const { data, loading, error, fetchData, callType } = useConsumApi('');

    useEffect(() => {
        loadDemandes();
    }, []);

    useEffect(() => {
        if (data && callType === 'loadDemandes') {
            const list = Array.isArray(data) ? data : data.content || [];
            // Filter only demandes that need or have analysis
            setDemandes(list.filter((d: any) =>
                d.statusCode === 'EN_ANALYSE' ||
                d.statusCode === 'SOUMISE' ||
                d.statusCode === 'EN_VISITE' ||
                d.statusCode === 'EN_COMITE'
            ));
        }
        if (error) {
            toast.current?.show({ severity: 'error', summary: 'Erreur', detail: error.message, life: 3000 });
        }
    }, [data, error, callType]);

    const loadDemandes = () => {
        fetchData(null, 'GET', `${BASE_URL}/findall`, 'loadDemandes');
    };

    const goToAnalysis = (rowData: any) => {
        router.push(`/credit/analyses/${rowData.id}`);
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'BIF',
            minimumFractionDigits: 0
        }).format(value || 0);
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('fr-FR');
    };

    const statusBodyTemplate = (rowData: any) => {
        const statusColors: Record<string, string> = {
            'SOUMISE': 'info',
            'EN_ANALYSE': 'warning',
            'EN_VISITE': 'warning',
            'EN_COMITE': 'info'
        };
        return <Tag value={rowData.statusName || rowData.statusCode} severity={statusColors[rowData.statusCode] as any || 'secondary'} />;
    };

    const analysisStatusTemplate = (rowData: any) => {
        if (rowData.hasFinancialAnalysis) {
            return <Tag value="Complétée" severity="success" icon="pi pi-check" />;
        }
        return <Tag value="En attente" severity="warning" icon="pi pi-clock" />;
    };

    const actionsBodyTemplate = (rowData: any) => (
        <div className="flex gap-2">
            <Button
                icon="pi pi-chart-line"
                rounded
                text
                severity="info"
                onClick={() => goToAnalysis(rowData)}
                tooltip="Analyse Financière"
            />
        </div>
    );

    const header = (
        <div className="flex flex-wrap gap-2 align-items-center justify-content-between">
            <h5 className="m-0">
                <i className="pi pi-chart-line mr-2"></i>
                Analyses Financières en Cours
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
                value={demandes}
                paginator
                rows={10}
                rowsPerPageOptions={[5, 10, 25, 50]}
                loading={loading}
                globalFilter={globalFilter}
                header={header}
                emptyMessage="Aucune demande en attente d'analyse"
                className="p-datatable-sm"
            >
                <Column field="applicationNumber" header="N° Dossier" sortable filter />
                <Column field="clientName" header="Client" sortable filter />
                <Column field="amountRequested" header="Montant Demandé" body={(row) => formatCurrency(row.amountRequested)} sortable />
                <Column field="applicationDate" header="Date Dépôt" body={(row) => formatDate(row.applicationDate)} sortable />
                <Column header="Statut Demande" body={statusBodyTemplate} />
                <Column header="Analyse" body={analysisStatusTemplate} />
                <Column field="creditOfficerName" header="Agent de Crédit" sortable filter />
                <Column header="Actions" body={actionsBodyTemplate} style={{ width: '100px' }} />
            </DataTable>
        </div>
    );
}
