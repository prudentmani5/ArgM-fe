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
    { label: 'En attente', value: 'PENDING' },
    { label: 'Approuvé', value: 'APPROVED' },
    { label: 'Rejeté', value: 'REJECTED' },
    { label: 'Traité', value: 'PROCESSED' }
];

const TYPES = [
    { label: 'Total', value: 'TOTAL' },
    { label: 'Partiel', value: 'PARTIAL' }
];

export default function RapportRemboursementAnticipePage() {
    const [demandes, setDemandes] = useState<any[]>([]);
    const [filters, setFilters] = useState<any>({
        dateRange: null,
        status: null,
        type: null
    });
    const toast = useRef<Toast>(null);
    const dt = useRef<DataTable<any[]>>(null);

    const { data, loading, error, fetchData } = useConsumApi('');
    const BASE_URL = buildApiUrl('/api/remboursement/early-repayments');

    useEffect(() => {
        loadDemandes();
    }, []);

    useEffect(() => {
        if (data) {
            setDemandes(Array.isArray(data) ? data : data.content || []);
        }
        if (error) {
            toast.current?.show({ severity: 'error', summary: 'Erreur', detail: error.message || 'Une erreur est survenue', life: 3000 });
        }
    }, [data, error]);

    const loadDemandes = () => {
        fetchData(null, 'GET', `${BASE_URL}/findall`, 'loadDemandes');
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
    const filteredDemandes = demandes.filter((d: any) => {
        let match = true;
        if (filters.status) {
            match = match && d.status === filters.status;
        }
        if (filters.type) {
            match = match && d.repaymentType === filters.type;
        }
        if (filters.dateRange && filters.dateRange[0]) {
            const reqDate = new Date(d.requestDate);
            match = match && reqDate >= filters.dateRange[0];
            if (filters.dateRange[1]) {
                match = match && reqDate <= filters.dateRange[1];
            }
        }
        return match;
    });

    // Statistics
    const totalSettlement = filteredDemandes.reduce((sum, d) => sum + (d.totalSettlementAmount || 0), 0);
    const approvedCount = filteredDemandes.filter(d => d.status === 'APPROVED' || d.status === 'PROCESSED').length;
    const rejectedCount = filteredDemandes.filter(d => d.status === 'REJECTED').length;
    const totalSavings = filteredDemandes.reduce((sum, d) => sum + (d.clientInterestSavings || 0), 0);

    const statusBodyTemplate = (rowData: any) => {
        const labels: Record<string, string> = { 'PENDING': 'En attente', 'APPROVED': 'Approuvé', 'REJECTED': 'Rejeté', 'PROCESSED': 'Traité' };
        const severities: Record<string, any> = { 'PENDING': 'warning', 'APPROVED': 'success', 'REJECTED': 'danger', 'PROCESSED': 'info' };
        return <Tag value={labels[rowData.status] || rowData.status} severity={severities[rowData.status] || 'secondary'} />;
    };

    const typeBodyTemplate = (rowData: any) => {
        return <Tag value={rowData.repaymentType === 'TOTAL' ? 'Total' : 'Partiel'} severity={rowData.repaymentType === 'TOTAL' ? 'info' : 'warning'} />;
    };

    const exportCSV = () => {
        dt.current?.exportCSV();
    };

    const exportPdf = () => {
        exportToPDF({
            title: 'Rapport des Remboursements Anticipés',
            columns: [
                { header: 'N° Demande', dataKey: 'requestNumber' },
                { header: 'N° Crédit', dataKey: 'loanId' },
                { header: 'Date Demande', dataKey: 'requestDate', formatter: formatDatePDF },
                { header: 'Type', dataKey: 'repaymentType' },
                { header: 'Capital Restant', dataKey: 'remainingPrincipal', formatter: formatCurrencyPDF },
                { header: 'Pénalité', dataKey: 'penaltyForEarlyRepayment', formatter: formatCurrencyPDF },
                { header: 'Total Règlement', dataKey: 'totalSettlementAmount', formatter: formatCurrencyPDF },
                { header: 'Statut', dataKey: 'status' }
            ],
            data: filteredDemandes,
            filename: 'rapport_remboursement_anticipe.pdf',
            orientation: 'landscape',
            statistics: [
                { label: 'Total Demandes', value: filteredDemandes.length },
                { label: 'Montant Total', value: formatCurrency(totalSettlement) },
                { label: 'Approuvées', value: approvedCount },
                { label: 'Rejetées', value: rejectedCount }
            ]
        });
    };

    const header = (
        <div className="flex flex-wrap gap-2 align-items-center justify-content-between">
            <h5 className="m-0">Demandes de Remboursement Anticipé</h5>
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
                <i className="pi pi-fast-forward mr-2"></i>
                Rapport des Remboursements Anticipés
            </h2>

            <div className="surface-100 p-3 border-round mb-4">
                <h5 className="mb-3"><i className="pi pi-filter mr-2"></i>Filtres</h5>
                <div className="grid">
                    <div className="col-12 md:col-4">
                        <label className="font-semibold block mb-2">Période de demande</label>
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
                        <label className="font-semibold block mb-2">Type</label>
                        <Dropdown
                            value={filters.type}
                            options={TYPES}
                            onChange={(e) => setFilters({ ...filters, type: e.value })}
                            optionLabel="label"
                            optionValue="value"
                            placeholder="Tous les types"
                            className="w-full"
                            showClear
                        />
                    </div>
                </div>
            </div>

            <div className="grid mb-4">
                <div className="col-12 md:col-3">
                    <div className="bg-blue-100 p-3 border-round text-center">
                        <p className="text-500 m-0">Total Demandes</p>
                        <p className="text-2xl font-bold text-blue-700 m-0">{filteredDemandes.length}</p>
                    </div>
                </div>
                <div className="col-12 md:col-3">
                    <div className="bg-green-100 p-3 border-round text-center">
                        <p className="text-500 m-0">Montant Total</p>
                        <p className="text-2xl font-bold text-green-700 m-0">{formatCurrency(totalSettlement)}</p>
                    </div>
                </div>
                <div className="col-12 md:col-3">
                    <div className="bg-teal-100 p-3 border-round text-center">
                        <p className="text-500 m-0">Approuvées</p>
                        <p className="text-2xl font-bold text-teal-700 m-0">{approvedCount}</p>
                    </div>
                </div>
                <div className="col-12 md:col-3">
                    <div className="bg-red-100 p-3 border-round text-center">
                        <p className="text-500 m-0">Rejetées</p>
                        <p className="text-2xl font-bold text-red-700 m-0">{rejectedCount}</p>
                    </div>
                </div>
            </div>

            <DataTable
                ref={dt}
                value={filteredDemandes}
                loading={loading}
                paginator
                rows={10}
                rowsPerPageOptions={[5, 10, 25, 50]}
                emptyMessage="Aucune demande trouvée."
                stripedRows
                header={header}
                exportFilename="rapport_remboursement_anticipe"
                sortField="requestDate"
                sortOrder={-1}
                className="p-datatable-sm"
            >
                <Column field="requestNumber" header="N° Demande" sortable />
                <Column field="loanId" header="N° Crédit" sortable />
                <Column field="requestDate" header="Date Demande" body={(row) => formatDate(row.requestDate)} sortable />
                <Column header="Type" body={typeBodyTemplate} sortable />
                <Column field="remainingPrincipal" header="Capital Restant" body={(row) => formatCurrency(row.remainingPrincipal)} sortable />
                <Column field="penaltyForEarlyRepayment" header="Pénalité" body={(row) => formatCurrency(row.penaltyForEarlyRepayment)} />
                <Column field="totalSettlementAmount" header="Total Règlement" body={(row) => formatCurrency(row.totalSettlementAmount)} sortable />
                <Column field="clientInterestSavings" header="Économie Client" body={(row) => formatCurrency(row.clientInterestSavings)} />
                <Column field="status" header="Statut" body={statusBodyTemplate} sortable />
            </DataTable>
        </div>
    );
}
