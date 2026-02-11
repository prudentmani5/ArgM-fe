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
import { exportToPDF, formatCurrency as formatCurrencyPDF, formatDate as formatDatePDF } from '@/utils/pdfExport';

const BASE_URL = buildApiUrl('/api/credit/disbursements');

const disbursementModes = [
    { code: 'CASH', name: 'Espèces' },
    { code: 'VIREMENT', name: 'Virement Bancaire' },
    { code: 'CHEQUE', name: 'Chèque' },
    { code: 'MOBILE_MONEY', name: 'Mobile Money' }
];

export default function RapportDecaissementsPage() {
    const [decaissements, setDecaissements] = useState<any[]>([]);
    const [branches, setBranches] = useState<any[]>([]);
    const [filters, setFilters] = useState<any>({
        dateRange: null,
        branchId: null,
        modeCode: null
    });
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

    const exportPdf = () => {
        const getModeLabel = (mode: any): string => {
            const modeCode = getModeCode(mode);
            return mode?.nameFr || mode?.name || modeLabels[modeCode] || modeCode || '-';
        };

        exportToPDF({
            title: 'Rapport des Décaissements',
            columns: [
                { header: 'N° Dossier', dataKey: 'applicationNumber' },
                { header: 'Client', dataKey: 'clientName' },
                { header: 'Montant Décaissé', dataKey: 'amountDisbursed', formatter: formatCurrencyPDF },
                { header: 'Date Décaissement', dataKey: 'disbursementDate', formatter: formatDatePDF },
                { header: 'Mode', dataKey: 'disbursementMode', formatter: getModeLabel },
                { header: 'N° Compte', dataKey: 'accountNumber' },
                { header: 'Agence', dataKey: 'branchName' },
                { header: 'Responsable', dataKey: 'userAction' }
            ],
            data: filteredDecaissements,
            filename: 'rapport_decaissements.pdf',
            orientation: 'landscape',
            statistics: [
                { label: 'Total Décaissements', value: filteredDecaissements.length },
                { label: 'Montant Total', value: formatCurrency(totalAmount) }
            ]
        });
    };

    // Get disbursement mode code (handles both object and string)
    const getModeCode = (mode: any): string => {
        if (!mode) return '';
        if (typeof mode === 'string') return mode;
        return mode.code || '';
    };

    const modeBodyTemplate = (rowData: any) => {
        const modeCode = getModeCode(rowData.disbursementMode);
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
        // Use nameFr from object if available, otherwise use label mapping
        const label = rowData.disbursementMode?.nameFr || rowData.disbursementMode?.name || modeLabels[modeCode] || modeCode || '-';
        return <Tag value={label} severity={colors[modeCode] as any || 'info'} />;
    };

    // Filter data based on filters
    const filteredDecaissements = decaissements.filter((d: any) => {
        let match = true;
        if (filters.branchId) {
            match = match && (d.branchId === filters.branchId || d.branch?.id === filters.branchId);
        }
        if (filters.modeCode) {
            const modeCode = getModeCode(d.disbursementMode);
            match = match && modeCode === filters.modeCode;
        }
        if (filters.dateRange && filters.dateRange[0]) {
            const disbDate = new Date(d.disbursementDate);
            match = match && disbDate >= filters.dateRange[0];
            if (filters.dateRange[1]) {
                match = match && disbDate <= filters.dateRange[1];
            }
        }
        return match;
    });

    // Calculate statistics
    const totalAmount = filteredDecaissements.reduce((sum, d) => sum + (d.amount || 0), 0);
    const cashCount = filteredDecaissements.filter(d => getModeCode(d.disbursementMode) === 'CASH').length;
    const virementCount = filteredDecaissements.filter(d => getModeCode(d.disbursementMode) === 'VIREMENT').length;

    const header = (
        <div className="flex flex-wrap gap-2 align-items-center justify-content-between">
            <h5 className="m-0">
                <i className="pi pi-money-bill mr-2"></i>
                Rapport des Décaissements
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
                        <label className="font-semibold block mb-2">Mode de Décaissement</label>
                        <Dropdown
                            value={filters.modeCode}
                            options={disbursementModes}
                            onChange={(e) => setFilters({ ...filters, modeCode: e.value })}
                            optionLabel="name"
                            optionValue="code"
                            placeholder="Tous les modes"
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
                sortField="disbursementDate"
                sortOrder={-1}
            >
                <Column field="applicationNumber" header="N° Dossier" sortable />
                <Column field="clientName" header="Client" sortable />
                <Column field="amount" header="Montant" body={(row) => formatCurrency(row.amount)} sortable />
                <Column field="disbursementDate" header="Date" body={(row) => formatDate(row.disbursementDate)} sortable />
                <Column header="Mode" body={modeBodyTemplate} />
                <Column field="reference" header="Référence" sortable />
                <Column field="branchName" header="Agence" body={(row) => row.branch?.name || row.branchName || '-'} sortable />
                <Column field="userAction" header="Responsable" sortable />
            </DataTable>
        </div>
    );
}
