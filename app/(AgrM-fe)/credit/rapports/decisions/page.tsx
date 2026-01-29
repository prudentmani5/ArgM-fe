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

const BASE_URL = buildApiUrl('/api/credit/committee-decisions');

export default function RapportDecisionsPage() {
    const [decisions, setDecisions] = useState<any[]>([]);
    const [dateRange, setDateRange] = useState<Date[] | null>(null);
    const toast = useRef<Toast>(null);
    const dt = useRef<DataTable<any[]>>(null);

    const { data, loading, error, fetchData, callType } = useConsumApi('');

    useEffect(() => {
        loadDecisions();
    }, []);

    useEffect(() => {
        if (data && callType === 'loadDecisions') {
            setDecisions(Array.isArray(data) ? data : data.content || []);
        }
        if (error) {
            toast.current?.show({ severity: 'error', summary: 'Erreur', detail: error.message, life: 3000 });
        }
    }, [data, error, callType]);

    const loadDecisions = () => {
        fetchData(null, 'GET', `${BASE_URL}/findall`, 'loadDecisions');
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

    const exportCSV = () => {
        dt.current?.exportCSV();
    };

    const decisionBodyTemplate = (rowData: any) => {
        const colors: Record<string, string> = {
            'APPROUVE': 'success',
            'APPROUVE_SOUS_RESERVE': 'warning',
            'AJOURNE': 'info',
            'REJETE': 'danger'
        };
        return <Tag value={rowData.decisionName || rowData.decisionCode} severity={colors[rowData.decisionCode] as any || 'secondary'} />;
    };

    // Filter by date range
    const filteredDecisions = decisions.filter((d: any) => {
        if (!dateRange || !dateRange[0]) return true;
        const decisionDate = new Date(d.decisionDate);
        if (dateRange[1]) {
            return decisionDate >= dateRange[0] && decisionDate <= dateRange[1];
        }
        return decisionDate >= dateRange[0];
    });

    // Calculate statistics
    const totalAmount = filteredDecisions.reduce((sum, d) => sum + (d.amountApproved || 0), 0);
    const approved = filteredDecisions.filter(d => d.decisionCode === 'APPROUVE' || d.decisionCode === 'APPROUVE_SOUS_RESERVE').length;
    const rejected = filteredDecisions.filter(d => d.decisionCode === 'REJETE').length;
    const adjourned = filteredDecisions.filter(d => d.decisionCode === 'AJOURNE').length;

    const header = (
        <div className="flex flex-wrap gap-2 align-items-center justify-content-between">
            <h5 className="m-0">
                <i className="pi pi-users mr-2"></i>
                Rapport des Décisions du Comité
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
                        <p className="text-500 m-0">Total Décisions</p>
                        <p className="text-2xl font-bold m-0">{filteredDecisions.length}</p>
                    </div>
                </div>
                <div className="col-12 md:col-3">
                    <div className="bg-green-100 p-3 border-round text-center">
                        <p className="text-500 m-0">Approuvées</p>
                        <p className="text-2xl font-bold text-green-600 m-0">{approved}</p>
                    </div>
                </div>
                <div className="col-12 md:col-3">
                    <div className="bg-red-100 p-3 border-round text-center">
                        <p className="text-500 m-0">Rejetées</p>
                        <p className="text-2xl font-bold text-red-600 m-0">{rejected}</p>
                    </div>
                </div>
                <div className="col-12 md:col-3">
                    <div className="surface-100 p-3 border-round text-center">
                        <p className="text-500 m-0">Montant Approuvé</p>
                        <p className="text-2xl font-bold m-0">{formatCurrency(totalAmount)}</p>
                    </div>
                </div>
            </div>

            <DataTable
                ref={dt}
                value={filteredDecisions}
                paginator
                rows={10}
                rowsPerPageOptions={[5, 10, 25, 50]}
                loading={loading}
                header={header}
                emptyMessage="Aucune décision trouvée"
                className="p-datatable-sm"
                exportFilename="rapport_decisions_comite"
            >
                <Column field="sessionNumber" header="N° Session" sortable />
                <Column field="applicationNumber" header="N° Dossier" sortable />
                <Column field="clientName" header="Client" sortable />
                <Column field="amountRequested" header="Montant Demandé" body={(row) => formatCurrency(row.amountRequested)} sortable />
                <Column field="amountApproved" header="Montant Approuvé" body={(row) => formatCurrency(row.amountApproved)} sortable />
                <Column header="Décision" body={decisionBodyTemplate} />
                <Column field="decisionDate" header="Date Décision" body={(row) => formatDate(row.decisionDate)} sortable />
                <Column field="comments" header="Commentaires" />
            </DataTable>
        </div>
    );
}
