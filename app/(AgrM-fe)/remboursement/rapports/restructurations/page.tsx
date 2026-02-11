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
    { label: 'Actif', value: 'ACTIVE' }
];

export default function RapportRestructurationsPage() {
    const [restructurations, setRestructurations] = useState<any[]>([]);
    const [filters, setFilters] = useState<any>({
        dateRange: null,
        status: null
    });
    const toast = useRef<Toast>(null);
    const dt = useRef<DataTable<any[]>>(null);

    const { data, loading, error, fetchData } = useConsumApi('');
    const BASE_URL = buildApiUrl('/api/remboursement/restructurings');

    useEffect(() => {
        loadRestructurations();
    }, []);

    useEffect(() => {
        if (data) {
            setRestructurations(Array.isArray(data) ? data : data.content || []);
        }
        if (error) {
            toast.current?.show({ severity: 'error', summary: 'Erreur', detail: error.message || 'Une erreur est survenue', life: 3000 });
        }
    }, [data, error]);

    const loadRestructurations = () => {
        fetchData(null, 'GET', `${BASE_URL}/findall`, 'loadRestructurations');
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
    const filteredRestructurations = restructurations.filter((r: any) => {
        let match = true;
        if (filters.status) {
            match = match && r.status === filters.status;
        }
        if (filters.dateRange && filters.dateRange[0]) {
            const reqDate = new Date(r.requestDate);
            match = match && reqDate >= filters.dateRange[0];
            if (filters.dateRange[1]) {
                match = match && reqDate <= filters.dateRange[1];
            }
        }
        return match;
    });

    // Statistics
    const totalBalance = filteredRestructurations.reduce((sum, r) => sum + (r.originalRemainingBalance || 0), 0);
    const approvedCount = filteredRestructurations.filter(r => r.status === 'APPROVED' || r.status === 'ACTIVE').length;
    const totalFees = filteredRestructurations.reduce((sum, r) => sum + (r.restructuringFeeAmount || 0), 0);
    const pendingCount = filteredRestructurations.filter(r => r.status === 'PENDING').length;

    const statusBodyTemplate = (rowData: any) => {
        const labels: Record<string, string> = { 'PENDING': 'En attente', 'APPROVED': 'Approuvé', 'REJECTED': 'Rejeté', 'ACTIVE': 'Actif' };
        const severities: Record<string, any> = { 'PENDING': 'warning', 'APPROVED': 'success', 'REJECTED': 'danger', 'ACTIVE': 'info' };
        return <Tag value={labels[rowData.status] || rowData.status} severity={severities[rowData.status] || 'secondary'} />;
    };

    const exportCSV = () => {
        dt.current?.exportCSV();
    };

    const exportPdf = () => {
        exportToPDF({
            title: 'Rapport des Restructurations',
            columns: [
                { header: 'N° Crédit', dataKey: 'loanId' },
                { header: 'Date Demande', dataKey: 'requestDate', formatter: formatDatePDF },
                { header: 'Solde Original', dataKey: 'originalRemainingBalance', formatter: formatCurrencyPDF },
                { header: 'Nouveau Terme', dataKey: 'newTermMonths' },
                { header: 'Nouveau Taux', dataKey: 'newInterestRate' },
                { header: 'Frais', dataKey: 'restructuringFeeAmount', formatter: formatCurrencyPDF },
                { header: 'Nouvelle Mensualité', dataKey: 'newMonthlyPayment', formatter: formatCurrencyPDF },
                { header: 'Statut', dataKey: 'status' }
            ],
            data: filteredRestructurations,
            filename: 'rapport_restructurations.pdf',
            orientation: 'landscape',
            statistics: [
                { label: 'Total Demandes', value: filteredRestructurations.length },
                { label: 'Solde Total Restructuré', value: formatCurrency(totalBalance) },
                { label: 'Approuvées/Actives', value: approvedCount },
                { label: 'Total Frais', value: formatCurrency(totalFees) }
            ]
        });
    };

    const header = (
        <div className="flex flex-wrap gap-2 align-items-center justify-content-between">
            <h5 className="m-0">Demandes de Restructuration</h5>
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
                <i className="pi pi-refresh mr-2"></i>
                Rapport des Restructurations
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
                </div>
            </div>

            <div className="grid mb-4">
                <div className="col-12 md:col-3">
                    <div className="bg-blue-100 p-3 border-round text-center">
                        <p className="text-500 m-0">Total Demandes</p>
                        <p className="text-2xl font-bold text-blue-700 m-0">{filteredRestructurations.length}</p>
                    </div>
                </div>
                <div className="col-12 md:col-3">
                    <div className="bg-green-100 p-3 border-round text-center">
                        <p className="text-500 m-0">Approuvées/Actives</p>
                        <p className="text-2xl font-bold text-green-700 m-0">{approvedCount}</p>
                    </div>
                </div>
                <div className="col-12 md:col-3">
                    <div className="bg-orange-100 p-3 border-round text-center">
                        <p className="text-500 m-0">En Attente</p>
                        <p className="text-2xl font-bold text-orange-700 m-0">{pendingCount}</p>
                    </div>
                </div>
                <div className="col-12 md:col-3">
                    <div className="bg-purple-100 p-3 border-round text-center">
                        <p className="text-500 m-0">Total Frais</p>
                        <p className="text-2xl font-bold text-purple-700 m-0">{formatCurrency(totalFees)}</p>
                    </div>
                </div>
            </div>

            <div className="surface-100 p-3 border-round mb-4">
                <p className="m-0">
                    <i className="pi pi-info-circle mr-2"></i>
                    <strong>Rappel:</strong> Un crédit ne peut être restructuré qu'une seule fois. L'extension maximale est de 50% du terme original.
                </p>
            </div>

            <DataTable
                ref={dt}
                value={filteredRestructurations}
                loading={loading}
                paginator
                rows={10}
                rowsPerPageOptions={[5, 10, 25, 50]}
                emptyMessage="Aucune restructuration trouvée."
                stripedRows
                header={header}
                exportFilename="rapport_restructurations"
                sortField="requestDate"
                sortOrder={-1}
                className="p-datatable-sm"
            >
                <Column field="loanId" header="N° Crédit" sortable />
                <Column field="requestDate" header="Date Demande" body={(row) => formatDate(row.requestDate)} sortable />
                <Column field="originalRemainingBalance" header="Solde Original" body={(row) => formatCurrency(row.originalRemainingBalance)} sortable />
                <Column field="originalRemainingTerm" header="Terme Original" body={(row) => `${row.originalRemainingTerm || '-'} mois`} />
                <Column field="newTermMonths" header="Nouveau Terme" body={(row) => `${row.newTermMonths || '-'} mois`} />
                <Column field="newInterestRate" header="Nouveau Taux" body={(row) => row.newInterestRate ? `${row.newInterestRate}%` : '-'} />
                <Column field="restructuringFeeAmount" header="Frais" body={(row) => formatCurrency(row.restructuringFeeAmount)} />
                <Column field="newMonthlyPayment" header="Nouvelle Mensualité" body={(row) => formatCurrency(row.newMonthlyPayment)} sortable />
                <Column field="status" header="Statut" body={statusBodyTemplate} sortable />
            </DataTable>
        </div>
    );
}
