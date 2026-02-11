'use client';

import React, { useState, useEffect, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Calendar } from 'primereact/calendar';
import { Dropdown } from 'primereact/dropdown';
import { Toast } from 'primereact/toast';
import { Tag } from 'primereact/tag';
import useConsumApi from '../../../../../hooks/fetchData/useConsumApi';
import { buildApiUrl } from '../../../../../utils/apiConfig';
import { exportToPDF, formatCurrency as formatCurrencyPDF, formatDate as formatDatePDF } from '../../../../../utils/pdfExport';

const STATUTS = [
    { label: 'Actif', value: 'ACTIVE' },
    { label: 'Résolu', value: 'RESOLVED' },
    { label: 'Contentieux', value: 'LITIGATION' },
    { label: 'Clôturé', value: 'CLOSED' }
];

const PRIORITIES = [
    { label: 'Faible', value: 'LOW' },
    { label: 'Normal', value: 'NORMAL' },
    { label: 'Élevée', value: 'HIGH' },
    { label: 'Critique', value: 'CRITICAL' }
];

export default function RapportRecouvrementPage() {
    const [dossiers, setDossiers] = useState<any[]>([]);
    const [filters, setFilters] = useState<any>({
        dateRange: null,
        status: null,
        priority: null
    });
    const toast = useRef<Toast>(null);
    const dt = useRef<DataTable<any[]>>(null);

    const { data, loading, error, fetchData } = useConsumApi('');
    const BASE_URL = buildApiUrl('/api/remboursement/recovery-cases');

    useEffect(() => {
        loadDossiers();
    }, []);

    useEffect(() => {
        if (data) {
            setDossiers(Array.isArray(data) ? data : data.content || []);
        }
        if (error) {
            toast.current?.show({ severity: 'error', summary: 'Erreur', detail: error.message || 'Une erreur est survenue', life: 3000 });
        }
    }, [data, error]);

    const loadDossiers = () => {
        fetchData(null, 'GET', `${BASE_URL}/findall`, 'loadDossiers');
    };

    const formatCurrency = (value: number) => {
        if (!value && value !== 0) return '-';
        return new Intl.NumberFormat('fr-FR', { style: 'decimal', minimumFractionDigits: 0 }).format(value) + ' BIF';
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('fr-FR');
    };

    const getStageName = (row: any): string => {
        const stage = row.currentStage;
        if (!stage) return '-';
        if (typeof stage === 'object') return stage.nameFr || stage.name || stage.code || '-';
        return stage;
    };

    // Client-side filtering
    const filteredDossiers = dossiers.filter((d: any) => {
        let match = true;
        if (filters.status) {
            match = match && d.status === filters.status;
        }
        if (filters.priority) {
            match = match && d.priority === filters.priority;
        }
        if (filters.dateRange && filters.dateRange[0]) {
            const openDate = new Date(d.openedDate);
            match = match && openDate >= filters.dateRange[0];
            if (filters.dateRange[1]) {
                match = match && openDate <= filters.dateRange[1];
            }
        }
        return match;
    });

    // Statistics
    const totalOverdue = filteredDossiers.reduce((sum, d) => sum + (d.totalOverdue || 0), 0);
    const totalRecovered = filteredDossiers.reduce((sum, d) => sum + (d.amountRecovered || 0), 0);
    const activeCount = filteredDossiers.filter(d => d.status === 'ACTIVE').length;
    const recoveryRate = totalOverdue > 0 ? Math.round((totalRecovered / totalOverdue) * 100) : 0;

    const stageBodyTemplate = (rowData: any) => {
        return getStageName(rowData);
    };

    const statusBodyTemplate = (rowData: any) => {
        const labels: Record<string, string> = {
            'ACTIVE': 'Actif', 'RESOLVED': 'Résolu', 'LITIGATION': 'Contentieux', 'CLOSED': 'Clôturé', 'ESCALATED': 'Escaladé'
        };
        const severities: Record<string, any> = {
            'ACTIVE': 'warning', 'RESOLVED': 'success', 'LITIGATION': 'danger', 'CLOSED': 'secondary', 'ESCALATED': 'danger'
        };
        return <Tag value={labels[rowData.status] || rowData.status} severity={severities[rowData.status] || 'info'} />;
    };

    const priorityBodyTemplate = (rowData: any) => {
        const labels: Record<string, string> = { 'LOW': 'Faible', 'NORMAL': 'Normal', 'HIGH': 'Élevée', 'CRITICAL': 'Critique' };
        const severities: Record<string, any> = { 'LOW': 'success', 'NORMAL': 'info', 'HIGH': 'warning', 'CRITICAL': 'danger' };
        return <Tag value={labels[rowData.priority] || rowData.priority || '-'} severity={severities[rowData.priority] || 'secondary'} />;
    };

    const rateBodyTemplate = (rowData: any) => {
        const overdue = rowData.totalOverdue || 0;
        const recovered = rowData.amountRecovered || 0;
        const rate = overdue > 0 ? Math.round((recovered / overdue) * 100) : 0;
        return (
            <div className="flex align-items-center gap-2">
                <span>{rate}%</span>
                <div className="w-4rem h-0.5rem bg-gray-200 border-round">
                    <div
                        className={`h-full border-round ${rate >= 75 ? 'bg-green-500' : rate >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                        style={{ width: `${Math.min(rate, 100)}%` }}
                    />
                </div>
            </div>
        );
    };

    const exportCSV = () => {
        dt.current?.exportCSV();
    };

    const exportPdf = () => {
        exportToPDF({
            title: 'Rapport de Recouvrement',
            columns: [
                { header: 'N° Dossier', dataKey: 'caseNumber' },
                { header: 'N° Dossier Crédit', dataKey: 'applicationNumber' },
                { header: 'Date Ouverture', dataKey: 'openedDate', formatter: formatDatePDF },
                { header: 'Étape', dataKey: 'currentStage', formatter: (v: any) => typeof v === 'object' ? (v?.nameFr || v?.name || '-') : (v || '-') },
                { header: 'Montant Dû', dataKey: 'totalOverdue', formatter: formatCurrencyPDF },
                { header: 'Recouvré', dataKey: 'amountRecovered', formatter: formatCurrencyPDF },
                { header: 'Jours Retard', dataKey: 'currentDaysOverdue' },
                { header: 'Priorité', dataKey: 'priority' },
                { header: 'Statut', dataKey: 'status' }
            ],
            data: filteredDossiers,
            filename: 'rapport_recouvrement.pdf',
            orientation: 'landscape',
            statistics: [
                { label: 'Total Dossiers', value: filteredDossiers.length },
                { label: 'Montant Total Dû', value: formatCurrency(totalOverdue) },
                { label: 'Montant Recouvré', value: formatCurrency(totalRecovered) },
                { label: 'Taux de Recouvrement', value: `${recoveryRate}%` }
            ]
        });
    };

    const header = (
        <div className="flex flex-wrap gap-2 align-items-center justify-content-between">
            <h5 className="m-0">Dossiers de Recouvrement</h5>
            <div className="flex gap-2">
                <Button label="Exporter CSV" icon="pi pi-file-excel" severity="success" onClick={exportCSV} />
                <Button label="Exporter PDF" icon="pi pi-file-pdf" severity="danger" onClick={exportPdf} />
            </div>
        </div>
    );

    return (
        <div className="card">
            <Toast ref={toast} />

            <h2 className="mb-4">
                <i className="pi pi-users mr-2"></i>
                Rapport de Recouvrement
            </h2>

            <div className="surface-100 p-3 border-round mb-4">
                <h5 className="mb-3"><i className="pi pi-filter mr-2"></i>Filtres</h5>
                <div className="grid">
                    <div className="col-12 md:col-4">
                        <label className="font-semibold block mb-2">Période d'ouverture</label>
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
                        <label className="font-semibold block mb-2">Statut</label>
                        <Dropdown
                            value={filters.status}
                            options={STATUTS}
                            onChange={(e) => setFilters({ ...filters, status: e.value })}
                            optionLabel="label"
                            optionValue="value"
                            placeholder="Tous les statuts"
                            className="w-full"
                            showClear
                        />
                    </div>
                    <div className="col-12 md:col-4">
                        <label className="font-semibold block mb-2">Priorité</label>
                        <Dropdown
                            value={filters.priority}
                            options={PRIORITIES}
                            onChange={(e) => setFilters({ ...filters, priority: e.value })}
                            optionLabel="label"
                            optionValue="value"
                            placeholder="Toutes les priorités"
                            className="w-full"
                            showClear
                        />
                    </div>
                </div>
            </div>

            <div className="grid mb-4">
                <div className="col-12 md:col-3">
                    <div className="bg-blue-100 p-3 border-round text-center">
                        <p className="text-500 m-0">Total Dossiers</p>
                        <p className="text-2xl font-bold text-blue-700 m-0">{filteredDossiers.length}</p>
                    </div>
                </div>
                <div className="col-12 md:col-3">
                    <div className="bg-green-100 p-3 border-round text-center">
                        <p className="text-500 m-0">Montant Recouvré</p>
                        <p className="text-2xl font-bold text-green-700 m-0">{formatCurrency(totalRecovered)}</p>
                    </div>
                </div>
                <div className="col-12 md:col-3">
                    <div className="bg-orange-100 p-3 border-round text-center">
                        <p className="text-500 m-0">Dossiers Actifs</p>
                        <p className="text-2xl font-bold text-orange-700 m-0">{activeCount}</p>
                    </div>
                </div>
                <div className="col-12 md:col-3">
                    <div className="bg-purple-100 p-3 border-round text-center">
                        <p className="text-500 m-0">Taux de Recouvrement</p>
                        <p className="text-2xl font-bold text-purple-700 m-0">{recoveryRate}%</p>
                    </div>
                </div>
            </div>

            <DataTable
                ref={dt}
                value={filteredDossiers}
                loading={loading}
                paginator
                rows={10}
                rowsPerPageOptions={[5, 10, 25, 50]}
                emptyMessage="Aucun dossier trouvé."
                stripedRows
                header={header}
                exportFilename="rapport_recouvrement"
                sortField="openedDate"
                sortOrder={-1}
                className="p-datatable-sm"
            >
                <Column field="caseNumber" header="N° Dossier" sortable />
                <Column field="applicationNumber" header="N° Dossier Crédit" sortable />
                <Column field="openedDate" header="Date Ouverture" body={(row) => formatDate(row.openedDate)} sortable />
                <Column header="Étape" body={stageBodyTemplate} sortable />
                <Column field="totalOverdue" header="Montant Dû" body={(row) => formatCurrency(row.totalOverdue)} sortable />
                <Column field="amountRecovered" header="Recouvré" body={(row) => formatCurrency(row.amountRecovered)} />
                <Column header="Taux" body={rateBodyTemplate} />
                <Column field="currentDaysOverdue" header="Jours Retard" sortable />
                <Column field="priority" header="Priorité" body={priorityBodyTemplate} sortable />
                <Column field="status" header="Statut" body={statusBodyTemplate} sortable />
            </DataTable>
        </div>
    );
}
