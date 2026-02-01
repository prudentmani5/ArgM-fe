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

const BASE_URL = buildApiUrl('/api/credit/disbursements');

export default function RapportDecaissementsPage() {
    const [decaissements, setDecaissements] = useState<any[]>([]);
    const [branches, setBranches] = useState<any[]>([]);
    const [dateRange, setDateRange] = useState<Date[] | null>(null);
    const [branchFilter, setBranchFilter] = useState<number | null>(null);
    const toast = useRef<Toast>(null);
    const dt = useRef<DataTable<any[]>>(null);

    // Use separate hook instances for each data type to avoid race conditions
    const decaissementsApi = useConsumApi('');
    const branchesApi = useConsumApi('');

    useEffect(() => {
        loadDecaissements();
        loadBranches();
    }, []);

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

    const loadDecaissements = () => {
        decaissementsApi.fetchData(null, 'GET', `${BASE_URL}/findall`, 'loadDecaissements');
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

    const formatDate = (dateString: string) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('fr-FR');
    };

    const exportCSV = () => {
        dt.current?.exportCSV();
    };

    const modeBodyTemplate = (rowData: any) => {
        const modeLabels: Record<string, string> = {
            'CASH': 'Espèces',
            'VIREMENT': 'Virement',
            'CHEQUE': 'Chèque',
            'MOBILE_MONEY': 'Mobile Money'
        };
        const colors: Record<string, string> = {
            'CASH': 'success',
            'VIREMENT': 'info',
            'CHEQUE': 'warning',
            'MOBILE_MONEY': 'help'
        };
        return <Tag value={modeLabels[rowData.disbursementMode] || rowData.disbursementMode} severity={colors[rowData.disbursementMode] as any || 'info'} />;
    };

    // Filter data
    const filteredDecaissements = decaissements.filter((d: any) => {
        let match = true;
        if (branchFilter) {
            match = match && d.branchId === branchFilter;
        }
        if (dateRange && dateRange[0]) {
            const disbDate = new Date(d.disbursementDate);
            match = match && disbDate >= dateRange[0];
            if (dateRange[1]) {
                match = match && disbDate <= dateRange[1];
            }
        }
        return match;
    });

    // Calculate statistics
    const totalAmount = filteredDecaissements.reduce((sum, d) => sum + (d.amount || 0), 0);
    const cashCount = filteredDecaissements.filter(d => d.disbursementMode === 'CASH').length;
    const virementCount = filteredDecaissements.filter(d => d.disbursementMode === 'VIREMENT').length;

    const header = (
        <div className="flex flex-wrap gap-2 align-items-center justify-content-between">
            <h5 className="m-0">
                <i className="pi pi-money-bill mr-2"></i>
                Rapport des Décaissements
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
                <Dropdown
                    value={branchFilter}
                    options={branches}
                    onChange={(e) => setBranchFilter(e.value)}
                    optionLabel="name"
                    optionValue="id"
                    placeholder="Agence"
                    className="w-12rem"
                    showClear
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
                        <p className="text-500 m-0">Total Décaissements</p>
                        <p className="text-2xl font-bold m-0">{filteredDecaissements.length}</p>
                    </div>
                </div>
                <div className="col-12 md:col-3">
                    <div className="bg-green-100 p-3 border-round text-center">
                        <p className="text-500 m-0">Montant Total</p>
                        <p className="text-2xl font-bold text-green-600 m-0">{formatCurrency(totalAmount)}</p>
                    </div>
                </div>
                <div className="col-12 md:col-3">
                    <div className="surface-100 p-3 border-round text-center">
                        <p className="text-500 m-0">En Espèces</p>
                        <p className="text-2xl font-bold m-0">{cashCount}</p>
                    </div>
                </div>
                <div className="col-12 md:col-3">
                    <div className="surface-100 p-3 border-round text-center">
                        <p className="text-500 m-0">Par Virement</p>
                        <p className="text-2xl font-bold m-0">{virementCount}</p>
                    </div>
                </div>
            </div>

            <DataTable
                ref={dt}
                value={filteredDecaissements}
                paginator
                rows={10}
                rowsPerPageOptions={[5, 10, 25, 50]}
                loading={decaissementsApi.loading}
                header={header}
                emptyMessage="Aucun décaissement trouvé"
                className="p-datatable-sm"
                exportFilename="rapport_decaissements"
            >
                <Column field="applicationNumber" header="N° Dossier" sortable />
                <Column field="clientName" header="Client" sortable />
                <Column field="amount" header="Montant" body={(row) => formatCurrency(row.amount)} sortable />
                <Column field="disbursementDate" header="Date" body={(row) => formatDate(row.disbursementDate)} sortable />
                <Column header="Mode" body={modeBodyTemplate} />
                <Column field="reference" header="Référence" sortable />
                <Column field="branchName" header="Agence" sortable />
                <Column field="disbursedByName" header="Effectué par" sortable />
            </DataTable>
        </div>
    );
}
