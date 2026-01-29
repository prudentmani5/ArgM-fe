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

    const { data, loading, error, fetchData, callType } = useConsumApi('');

    useEffect(() => {
        loadDemandes();
        loadBranches();
        loadStatuts();
    }, []);

    useEffect(() => {
        if (data) {
            switch (callType) {
                case 'loadDemandes':
                    setDemandes(Array.isArray(data) ? data : data.content || []);
                    break;
                case 'loadBranches':
                    setBranches(Array.isArray(data) ? data : data.content || []);
                    break;
                case 'loadStatuts':
                    setStatuts(Array.isArray(data) ? data : data.content || []);
                    break;
            }
        }
        if (error) {
            toast.current?.show({ severity: 'error', summary: 'Erreur', detail: error.message, life: 3000 });
        }
    }, [data, error, callType]);

    const loadDemandes = () => {
        fetchData(null, 'GET', `${BASE_URL}/findall`, 'loadDemandes');
    };

    const loadBranches = () => {
        fetchData(null, 'GET', buildApiUrl('/api/branches/findall'), 'loadBranches');
    };

    const loadStatuts = () => {
        fetchData(null, 'GET', buildApiUrl('/api/credit/application-statuses/findall'), 'loadStatuts');
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
        toast.current?.show({ severity: 'info', summary: 'Export PDF', detail: 'Fonctionnalité en cours de développement', life: 3000 });
    };

    const statusBodyTemplate = (rowData: any) => {
        const colors: Record<string, string> = {
            'BROUILLON': 'secondary',
            'SOUMISE': 'info',
            'EN_ANALYSE': 'warning',
            'EN_VISITE': 'warning',
            'EN_COMITE': 'info',
            'APPROUVE': 'success',
            'REJETE': 'danger',
            'DECAISSE': 'success',
            'ANNULE': 'danger'
        };
        return <Tag value={rowData.statusName || rowData.statusCode} severity={colors[rowData.statusCode] as any || 'info'} />;
    };

    // Filter data based on filters
    const filteredDemandes = demandes.filter((d: any) => {
        let match = true;
        if (filters.branchId) {
            match = match && d.branchId === filters.branchId;
        }
        if (filters.statusId) {
            match = match && d.statusId === filters.statusId;
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
    const approvedCount = filteredDemandes.filter(d => d.statusCode === 'APPROUVE' || d.statusCode === 'DECAISSE').length;
    const rejectedCount = filteredDemandes.filter(d => d.statusCode === 'REJETE').length;
    const pendingCount = filteredDemandes.filter(d => !['APPROUVE', 'DECAISSE', 'REJETE', 'ANNULE'].includes(d.statusCode)).length;

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
                loading={loading && callType === 'loadDemandes'}
                header={header}
                emptyMessage="Aucune demande trouvée"
                className="p-datatable-sm"
                exportFilename="rapport_demandes_credit"
            >
                <Column field="applicationNumber" header="N° Dossier" sortable />
                <Column field="applicationDate" header="Date Dépôt" body={(row) => formatDate(row.applicationDate)} sortable />
                <Column field="clientName" header="Client" sortable />
                <Column field="amountRequested" header="Montant Demandé" body={(row) => formatCurrency(row.amountRequested)} sortable />
                <Column field="durationMonths" header="Durée (mois)" sortable />
                <Column header="Statut" body={statusBodyTemplate} />
                <Column field="branchName" header="Agence" sortable />
                <Column field="creditOfficerName" header="Agent de Crédit" sortable />
            </DataTable>
        </div>
    );
}
