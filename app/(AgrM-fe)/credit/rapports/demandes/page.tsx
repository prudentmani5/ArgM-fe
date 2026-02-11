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

export default function RapportDemandesPage() {
    const [demandes, setDemandes] = useState<any[]>([]);
    const [branches, setBranches] = useState<any[]>([]);
    const [statuts, setStatuts] = useState<any[]>([]);
    const [filters, setFilters] = useState<any>({
        dateRange: null,
        branchId: null,
        statusId: null
    });
    const toast = useRef<Toast>(null);
    const dt = useRef<DataTable<any[]>>(null);

    // Separate hook instances for each data type
    const demandesApi = useConsumApi('');
    const branchesApi = useConsumApi('');
    const statutsApi = useConsumApi('');

    useEffect(() => {
        loadDemandes();
        loadBranches();
        loadStatuts();
    }, []);

    // Handle demandes data
    useEffect(() => {
        if (demandesApi.data) {
            setDemandes(Array.isArray(demandesApi.data) ? demandesApi.data : demandesApi.data.content || []);
        }
        if (demandesApi.error) {
            toast.current?.show({ severity: 'error', summary: 'Erreur', detail: demandesApi.error.message, life: 3000 });
        }
    }, [demandesApi.data, demandesApi.error]);

    // Handle branches data
    useEffect(() => {
        if (branchesApi.data) {
            setBranches(Array.isArray(branchesApi.data) ? branchesApi.data : branchesApi.data.content || []);
        }
        if (branchesApi.error) {
            toast.current?.show({ severity: 'error', summary: 'Erreur', detail: 'Erreur lors du chargement des agences', life: 3000 });
        }
    }, [branchesApi.data, branchesApi.error]);

    // Handle statuts data
    useEffect(() => {
        if (statutsApi.data) {
            setStatuts(Array.isArray(statutsApi.data) ? statutsApi.data : statutsApi.data.content || []);
        }
        if (statutsApi.error) {
            toast.current?.show({ severity: 'error', summary: 'Erreur', detail: 'Erreur lors du chargement des statuts', life: 3000 });
        }
    }, [statutsApi.data, statutsApi.error]);

    const loadDemandes = () => {
        demandesApi.fetchData(null, 'GET', `${BASE_URL}/findall`, 'loadDemandes');
    };

    const loadBranches = () => {
        branchesApi.fetchData(null, 'GET', buildApiUrl('/api/reference-data/branches/findall'), 'loadBranches');
    };

    const loadStatuts = () => {
        statutsApi.fetchData(null, 'GET', buildApiUrl('/api/credit/application-statuses/findall'), 'loadStatuts');
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
            title: 'Rapport des Demandes de Crédit',
            columns: [
                { header: 'N° Dossier', dataKey: 'applicationNumber' },
                { header: 'Date Dépôt', dataKey: 'applicationDate', formatter: formatDatePDF },
                {
                    header: 'Client',
                    dataKey: 'client',
                    formatter: (client: any) => client ? `${client.firstName} ${client.lastName}` : '-'
                },
                { header: 'Montant Demandé', dataKey: 'amountRequested', formatter: formatCurrencyPDF },
                { header: 'Durée (mois)', dataKey: 'durationMonths' },
                {
                    header: 'Statut',
                    dataKey: 'status',
                    formatter: (status: any) => status?.nameFr || status?.name || '-'
                },
                {
                    header: 'Agence',
                    dataKey: 'branch',
                    formatter: (branch: any) => branch?.name || '-'
                },
                { header: 'Responsable', dataKey: 'userAction' }
            ],
            data: filteredDemandes,
            filename: 'rapport_demandes_credit.pdf',
            orientation: 'landscape',
            statistics: [
                { label: 'Total Demandes', value: filteredDemandes.length },
                { label: 'Montant Total', value: formatCurrency(totalAmount) },
                { label: 'Approuvées', value: approvedCount },
                { label: 'Rejetées', value: rejectedCount }
            ]
        });
    };

    const statusBodyTemplate = (rowData: any) => {
        const status = rowData.status;
        if (status) {
            return <Tag value={status.nameFr || status.name} style={{ backgroundColor: status.color || '#6366f1' }} />;
        }
        return <Tag value="-" severity="info" />;
    };

    // Filter data based on filters
    const filteredDemandes = demandes.filter((d: any) => {
        let match = true;
        if (filters.branchId) {
            match = match && d.branchId === filters.branchId;
        }
        if (filters.statusId) {
            match = match && (d.statusId === filters.statusId || d.status?.id === filters.statusId);
        }
        if (filters.dateRange && filters.dateRange[0]) {
            const appDate = new Date(d.applicationDate);
            match = match && appDate >= filters.dateRange[0];
            if (filters.dateRange[1]) {
                match = match && appDate <= filters.dateRange[1];
            }
        }
        return match;
    });

    // Calculate statistics
    const totalAmount = filteredDemandes.reduce((sum, d) => sum + (d.amountRequested || 0), 0);
    const approvedCount = filteredDemandes.filter(d =>
        d.status?.code === 'APPROUVE' || d.status?.code === 'APPROVED' ||
        d.status?.code === 'DECAISSE' || d.status?.code === 'DISBURSED'
    ).length;
    const rejectedCount = filteredDemandes.filter(d =>
        d.status?.code === 'REJETE' || d.status?.code === 'REJECTED'
    ).length;
    const pendingCount = filteredDemandes.filter(d =>
        !['APPROUVE', 'APPROVED', 'DECAISSE', 'DISBURSED', 'REJETE', 'REJECTED', 'ANNULE', 'CANCELLED'].includes(d.status?.code || '')
    ).length;

    const clientBodyTemplate = (rowData: any) => {
        const client = rowData.client;
        return client ? `${client.firstName} ${client.lastName}` : '-';
    };

    const branchBodyTemplate = (rowData: any) => {
        return rowData.branch?.name || '-';
    };

    const creditOfficerBodyTemplate = (rowData: any) => {
        const officer = rowData.creditOfficer;
        if (officer) {
            return `${officer.firstName || ''} ${officer.lastName || ''}`.trim() || officer.email || '-';
        }
        return rowData.userAction || '-';
    };

    const header = (
        <div className="flex flex-wrap gap-2 align-items-center justify-content-between">
            <h5 className="m-0">
                <i className="pi pi-file mr-2"></i>
                Rapport des Demandes de Crédit
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
                            value={filters.statusId}
                            options={statuts}
                            onChange={(e) => setFilters({ ...filters, statusId: e.value })}
                            optionLabel="nameFr"
                            optionValue="id"
                            placeholder="Tous les statuts"
                            className="w-full"
                            showClear
                            filter
                        />
                    </div>
                </div>
            </div>

            {/* Statistics */}
            <div className="grid mb-4">
                <div className="col-12 md:col-3">
                    <div className="surface-100 p-3 border-round text-center">
                        <p className="text-500 m-0">Total Demandes</p>
                        <p className="text-2xl font-bold m-0">{filteredDemandes.length}</p>
                    </div>
                </div>
                <div className="col-12 md:col-3">
                    <div className="surface-100 p-3 border-round text-center">
                        <p className="text-500 m-0">Montant Total Demandé</p>
                        <p className="text-2xl font-bold m-0">{formatCurrency(totalAmount)}</p>
                    </div>
                </div>
                <div className="col-12 md:col-2">
                    <div className="bg-green-100 p-3 border-round text-center">
                        <p className="text-500 m-0">Approuvées</p>
                        <p className="text-2xl font-bold text-green-600 m-0">{approvedCount}</p>
                    </div>
                </div>
                <div className="col-12 md:col-2">
                    <div className="bg-red-100 p-3 border-round text-center">
                        <p className="text-500 m-0">Rejetées</p>
                        <p className="text-2xl font-bold text-red-600 m-0">{rejectedCount}</p>
                    </div>
                </div>
                <div className="col-12 md:col-2">
                    <div className="bg-yellow-100 p-3 border-round text-center">
                        <p className="text-500 m-0">En Cours</p>
                        <p className="text-2xl font-bold text-yellow-600 m-0">{pendingCount}</p>
                    </div>
                </div>
            </div>

            <DataTable
                ref={dt}
                value={filteredDemandes}
                paginator
                rows={10}
                rowsPerPageOptions={[5, 10, 25, 50]}
                loading={demandesApi.loading}
                header={header}
                emptyMessage="Aucune demande trouvée"
                className="p-datatable-sm"
                exportFilename="rapport_demandes_credit"
                sortField="applicationDate"
                sortOrder={-1}
            >
                <Column field="applicationNumber" header="N° Dossier" sortable />
                <Column field="applicationDate" header="Date Dépôt" body={(row) => formatDate(row.applicationDate)} sortable />
                <Column header="Client" body={clientBodyTemplate} sortable />
                <Column field="amountRequested" header="Montant Demandé" body={(row) => formatCurrency(row.amountRequested)} sortable />
                <Column field="durationMonths" header="Durée (mois)" sortable />
                <Column header="Statut" body={statusBodyTemplate} />
                <Column header="Agence" body={branchBodyTemplate} sortable />
                <Column field="userAction" header="Responsable" sortable />
            </DataTable>
        </div>
    );
}
