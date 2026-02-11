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

const STATUTS_CONTENTIEUX = [
    { label: 'En attente', value: 'PENDING' },
    { label: 'Déposé', value: 'FILED' },
    { label: 'Audience', value: 'HEARING' },
    { label: 'Jugement', value: 'JUDGMENT' },
    { label: 'Exécution', value: 'EXECUTION' },
    { label: 'Clôturé', value: 'CLOSED' }
];

export default function RapportContentieuxPage() {
    const [dossiers, setDossiers] = useState<any[]>([]);
    const [filters, setFilters] = useState<any>({
        dateRange: null,
        status: null
    });
    const toast = useRef<Toast>(null);
    const dt = useRef<DataTable<any[]>>(null);

    const { data, loading, error, fetchData } = useConsumApi('');
    const BASE_URL = buildApiUrl('/api/remboursement/legal-cases');

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

    // Client-side filtering
    const filteredDossiers = dossiers.filter((d: any) => {
        let match = true;
        if (filters.status) {
            match = match && d.status === filters.status;
        }
        if (filters.dateRange && filters.dateRange[0]) {
            const tDate = new Date(d.transferDate);
            match = match && tDate >= filters.dateRange[0];
            if (filters.dateRange[1]) {
                match = match && tDate <= filters.dateRange[1];
            }
        }
        return match;
    });

    // Statistics
    const totalAmount = filteredDossiers.reduce((sum, d) => sum + (d.amountAtTransfer || 0), 0);
    const totalRecovered = filteredDossiers.reduce((sum, d) => sum + (d.amountRecovered || 0), 0);
    const totalLegalCosts = filteredDossiers.reduce((sum, d) => sum + (d.totalLegalCosts || 0), 0);
    const awaitingDG = filteredDossiers.filter(d => d.dgApprovalRequired && !d.dgApprovedBy).length;

    const statusBodyTemplate = (rowData: any) => {
        const labels: Record<string, string> = {
            'PENDING': 'En attente', 'FILED': 'Déposé', 'HEARING': 'Audience',
            'JUDGMENT': 'Jugement', 'EXECUTION': 'Exécution', 'CLOSED': 'Clôturé'
        };
        const severities: Record<string, any> = {
            'PENDING': 'secondary', 'FILED': 'info', 'HEARING': 'warning',
            'JUDGMENT': 'info', 'EXECUTION': 'warning', 'CLOSED': 'success'
        };
        return <Tag value={labels[rowData.status] || rowData.status} severity={severities[rowData.status] || 'secondary'} />;
    };

    const dgApprovalBodyTemplate = (rowData: any) => {
        if (!rowData.dgApprovalRequired) {
            return <Tag value="Non requis" severity="secondary" />;
        }
        if (rowData.dgApprovedBy) {
            return <Tag value="Approuvé" severity="success" />;
        }
        return <Tag value="En attente" severity="warning" icon="pi pi-clock" />;
    };

    const outcomeBodyTemplate = (rowData: any) => {
        if (!rowData.outcome) return '-';
        const labels: Record<string, string> = {
            'RECOVERED': 'Recouvré', 'PARTIAL': 'Partiel', 'WRITE_OFF': 'Passé en perte', 'SETTLED': 'Réglé'
        };
        const severities: Record<string, any> = {
            'RECOVERED': 'success', 'PARTIAL': 'warning', 'WRITE_OFF': 'danger', 'SETTLED': 'info'
        };
        return <Tag value={labels[rowData.outcome] || rowData.outcome} severity={severities[rowData.outcome] || 'secondary'} />;
    };

    const exportCSV = () => {
        dt.current?.exportCSV();
    };

    const exportPdf = () => {
        exportToPDF({
            title: 'Rapport des Dossiers Contentieux',
            columns: [
                { header: 'N° Dossier', dataKey: 'caseNumber' },
                { header: 'N° Crédit', dataKey: 'loanId' },
                { header: 'Montant', dataKey: 'amountAtTransfer', formatter: formatCurrencyPDF },
                { header: 'Recouvré', dataKey: 'amountRecovered', formatter: formatCurrencyPDF },
                { header: 'Frais Juridiques', dataKey: 'totalLegalCosts', formatter: formatCurrencyPDF },
                { header: 'Date Transfert', dataKey: 'transferDate', formatter: formatDatePDF },
                { header: 'Tribunal', dataKey: 'courtName' },
                { header: 'Avocat', dataKey: 'lawyerName' },
                { header: 'Statut', dataKey: 'status' }
            ],
            data: filteredDossiers,
            filename: 'rapport_contentieux.pdf',
            orientation: 'landscape',
            statistics: [
                { label: 'Dossiers Contentieux', value: filteredDossiers.length },
                { label: 'Montant Total', value: formatCurrency(totalAmount) },
                { label: 'Montant Recouvré', value: formatCurrency(totalRecovered) },
                { label: 'En attente Approbation DG', value: awaitingDG }
            ]
        });
    };

    const header = (
        <div className="flex flex-wrap gap-2 align-items-center justify-content-between">
            <h5 className="m-0">Dossiers Contentieux</h5>
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
                <i className="pi pi-briefcase mr-2"></i>
                Rapport des Dossiers Contentieux
            </h2>

            <div className="surface-100 p-3 border-round mb-4">
                <h5 className="mb-3"><i className="pi pi-filter mr-2"></i>Filtres</h5>
                <div className="grid">
                    <div className="col-12 md:col-4">
                        <label className="font-semibold block mb-2">Période de transfert</label>
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
                            options={STATUTS_CONTENTIEUX}
                            onChange={(e) => setFilters({ ...filters, status: e.value })}
                            optionLabel="label"
                            optionValue="value"
                            placeholder="Tous les statuts"
                            className="w-full"
                            showClear
                        />
                    </div>
                </div>
            </div>

            <div className="grid mb-4">
                <div className="col-12 md:col-3">
                    <div className="bg-red-100 p-3 border-round text-center">
                        <p className="text-500 m-0">Dossiers Contentieux</p>
                        <p className="text-2xl font-bold text-red-700 m-0">{filteredDossiers.length}</p>
                    </div>
                </div>
                <div className="col-12 md:col-3">
                    <div className="bg-orange-100 p-3 border-round text-center">
                        <p className="text-500 m-0">Montant Total</p>
                        <p className="text-2xl font-bold text-orange-700 m-0">{formatCurrency(totalAmount)}</p>
                    </div>
                </div>
                <div className="col-12 md:col-3">
                    <div className="bg-green-100 p-3 border-round text-center">
                        <p className="text-500 m-0">Montant Recouvré</p>
                        <p className="text-2xl font-bold text-green-700 m-0">{formatCurrency(totalRecovered)}</p>
                    </div>
                </div>
                <div className="col-12 md:col-3">
                    <div className="bg-yellow-100 p-3 border-round text-center">
                        <p className="text-500 m-0">En attente Approbation DG</p>
                        <p className="text-2xl font-bold text-yellow-700 m-0">{awaitingDG}</p>
                    </div>
                </div>
            </div>

            <div className="surface-100 p-3 border-round mb-4">
                <p className="m-0">
                    <i className="pi pi-info-circle mr-2"></i>
                    <strong>Rappel:</strong> Tout dossier contentieux superieur a 500 000 FBU necessite l'approbation du Directeur General.
                </p>
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
                exportFilename="rapport_contentieux"
                sortField="transferDate"
                sortOrder={-1}
                className="p-datatable-sm"
            >
                <Column field="caseNumber" header="N° Dossier" sortable />
                <Column field="loanId" header="N° Crédit" sortable />
                <Column field="amountAtTransfer" header="Montant" body={(row) => formatCurrency(row.amountAtTransfer)} sortable />
                <Column field="amountRecovered" header="Recouvré" body={(row) => formatCurrency(row.amountRecovered)} />
                <Column field="totalLegalCosts" header="Frais Juridiques" body={(row) => formatCurrency(row.totalLegalCosts)} />
                <Column field="transferDate" header="Date Transfert" body={(row) => formatDate(row.transferDate)} sortable />
                <Column field="courtName" header="Tribunal" sortable />
                <Column field="status" header="Statut" body={statusBodyTemplate} sortable />
                <Column header="Approbation DG" body={dgApprovalBodyTemplate} />
                <Column header="Résultat" body={outcomeBodyTemplate} />
            </DataTable>
        </div>
    );
}
