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

const BASE_URL = buildApiUrl('/api/credit/applications');

const decisionTypes = [
    { code: 'APPROUVE', name: 'Approuvé' },
    { code: 'APPROUVE_SOUS_RESERVE', name: 'Approuvé sous réserve' },
    { code: 'AJOURNE', name: 'Ajourné' },
    { code: 'REJETE', name: 'Rejeté' }
];

export default function RapportDecisionsPage() {
    const [decisions, setDecisions] = useState<any[]>([]);
    const [branches, setBranches] = useState<any[]>([]);
    const [filters, setFilters] = useState<any>({
        dateRange: null,
        branchId: null,
        decisionCode: null
    });
    const toast = useRef<Toast>(null);
    const dt = useRef<DataTable<any[]>>(null);

    // Separate hook instances for each data type
    const decisionsApi = useConsumApi('');
    const branchesApi = useConsumApi('');

    useEffect(() => {
        loadDecisions();
        loadBranches();
    }, []);

    // Handle decisions data
    useEffect(() => {
        if (decisionsApi.data) {
            const rawData = Array.isArray(decisionsApi.data) ? decisionsApi.data : decisionsApi.data.content || [];
            // Map backend fields to frontend expected fields
            const mappedData = rawData.map((item: any) => ({
                ...item,
                sessionNumber: item.committeeSessionId ? `COM-${item.committeeSessionId}` : '-',
                applicationNumber: item.applicationNumber || '-',
                clientName: item.client
                    ? `${item.client.firstName || ''} ${item.client.lastName || ''}`.trim()
                    : '-',
                decisionCode: item.committeeDecision?.code,
                decisionName: item.committeeDecision?.nameFr || item.committeeDecision?.name,
                decisionDate: item.committeeDecisionDate,
                branchId: item.branch?.id,
                branchName: item.branch?.name || '-',
                comments: item.approvalConditions || item.rejectionReason || '-'
            }));
            setDecisions(mappedData);
        }
        if (decisionsApi.error) {
            toast.current?.show({ severity: 'error', summary: 'Erreur', detail: decisionsApi.error.message, life: 3000 });
        }
    }, [decisionsApi.data, decisionsApi.error]);

    // Handle branches data
    useEffect(() => {
        if (branchesApi.data) {
            setBranches(Array.isArray(branchesApi.data) ? branchesApi.data : branchesApi.data.content || []);
        }
    }, [branchesApi.data]);

    const loadDecisions = () => {
        decisionsApi.fetchData(null, 'GET', `${BASE_URL}/committee-decisions/findall`, 'loadDecisions');
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
        exportToPDF({
            title: 'Rapport des Décisions du Comité',
            columns: [
                { header: 'N° Session', dataKey: 'sessionNumber' },
                { header: 'N° Dossier', dataKey: 'applicationNumber' },
                { header: 'Client', dataKey: 'clientName' },
                { header: 'Montant Demandé', dataKey: 'amountRequested', formatter: formatCurrencyPDF },
                { header: 'Montant Approuvé', dataKey: 'amountApproved', formatter: formatCurrencyPDF },
                { header: 'Décision', dataKey: 'decisionName' },
                { header: 'Date Décision', dataKey: 'decisionDate', formatter: formatDatePDF },
                { header: 'Responsable', dataKey: 'userAction' }
            ],
            data: filteredDecisions,
            filename: 'rapport_decisions_comite.pdf',
            orientation: 'landscape',
            statistics: [
                { label: 'Total Décisions', value: filteredDecisions.length },
                { label: 'Approuvées', value: approved },
                { label: 'Rejetées', value: rejected },
                { label: 'Montant Approuvé', value: formatCurrency(totalAmount) }
            ]
        });
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

    // Filter data based on filters
    const filteredDecisions = decisions.filter((d: any) => {
        let match = true;
        if (filters.branchId) {
            match = match && (d.branchId === filters.branchId || d.branch?.id === filters.branchId);
        }
        if (filters.decisionCode) {
            match = match && d.decisionCode === filters.decisionCode;
        }
        if (filters.dateRange && filters.dateRange[0]) {
            const decisionDate = new Date(d.decisionDate);
            match = match && decisionDate >= filters.dateRange[0];
            if (filters.dateRange[1]) {
                match = match && decisionDate <= filters.dateRange[1];
            }
        }
        return match;
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
                        <label className="font-semibold block mb-2">Décision</label>
                        <Dropdown
                            value={filters.decisionCode}
                            options={decisionTypes}
                            onChange={(e) => setFilters({ ...filters, decisionCode: e.value })}
                            optionLabel="name"
                            optionValue="code"
                            placeholder="Toutes les décisions"
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
                loading={decisionsApi.loading}
                header={header}
                emptyMessage="Aucune décision trouvée"
                className="p-datatable-sm"
                exportFilename="rapport_decisions_comite"
                sortField="decisionDate"
                sortOrder={-1}
            >
                <Column field="sessionNumber" header="N° Session" sortable />
                <Column field="applicationNumber" header="N° Dossier" sortable />
                <Column field="clientName" header="Client" sortable />
                <Column field="amountRequested" header="Montant Demandé" body={(row) => formatCurrency(row.amountRequested)} sortable />
                <Column field="amountApproved" header="Montant Approuvé" body={(row) => formatCurrency(row.amountApproved)} sortable />
                <Column header="Décision" body={decisionBodyTemplate} />
                <Column field="decisionDate" header="Date Décision" body={(row) => formatDate(row.decisionDate)} sortable />
                <Column field="userAction" header="Responsable" sortable />
                <Column field="comments" header="Commentaires" />
            </DataTable>
        </div>
    );
}
