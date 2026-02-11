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
    { label: 'Partiel', value: 'PARTIAL' },
    { label: 'Payé', value: 'PAID' },
    { label: 'En retard', value: 'OVERDUE' }
];

export default function RapportEcheanciersPage() {
    const [echeanciers, setEcheanciers] = useState<any[]>([]);
    const [filters, setFilters] = useState<any>({
        dateRange: null,
        status: null
    });
    const toast = useRef<Toast>(null);
    const dt = useRef<DataTable<any[]>>(null);

    const { data, loading, error, fetchData } = useConsumApi('');
    const BASE_URL = buildApiUrl('/api/remboursement/schedules');

    useEffect(() => {
        loadEcheanciers();
    }, []);

    useEffect(() => {
        if (data) {
            setEcheanciers(Array.isArray(data) ? data : data.content || []);
        }
        if (error) {
            toast.current?.show({ severity: 'error', summary: 'Erreur', detail: error.message || 'Une erreur est survenue', life: 3000 });
        }
    }, [data, error]);

    const loadEcheanciers = () => {
        fetchData(null, 'GET', `${BASE_URL}/findall`, 'loadEcheanciers');
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
    const filteredEcheanciers = echeanciers.filter((e: any) => {
        let match = true;
        if (filters.status) {
            match = match && e.status === filters.status;
        }
        if (filters.dateRange && filters.dateRange[0]) {
            const dueDate = new Date(e.dueDate);
            match = match && dueDate >= filters.dateRange[0];
            if (filters.dateRange[1]) {
                match = match && dueDate <= filters.dateRange[1];
            }
        }
        return match;
    });

    // Statistics
    const totalDue = filteredEcheanciers.reduce((sum, e) => sum + (e.totalDue || 0), 0);
    const totalPaid = filteredEcheanciers.reduce((sum, e) => sum + (e.totalPaid || 0), 0);
    const paidCount = filteredEcheanciers.filter(e => e.status === 'PAID').length;
    const paymentRate = filteredEcheanciers.length > 0 ? Math.round((paidCount / filteredEcheanciers.length) * 100) : 0;

    const statusBodyTemplate = (rowData: any) => {
        const labels: Record<string, string> = { 'PENDING': 'En attente', 'PARTIAL': 'Partiel', 'PAID': 'Payé', 'OVERDUE': 'En retard' };
        const severities: Record<string, any> = { 'PENDING': 'info', 'PARTIAL': 'warning', 'PAID': 'success', 'OVERDUE': 'danger' };
        return <Tag value={labels[rowData.status] || rowData.status} severity={severities[rowData.status] || 'secondary'} />;
    };

    const exportCSV = () => {
        dt.current?.exportCSV();
    };

    const exportPdf = () => {
        exportToPDF({
            title: 'Rapport des Echeanciers',
            columns: [
                { header: 'N° Crédit', dataKey: 'loanId' },
                { header: 'N° Échéance', dataKey: 'installmentNumber' },
                { header: 'Date Échéance', dataKey: 'dueDate', formatter: formatDatePDF },
                { header: 'Capital', dataKey: 'principalDue', formatter: formatCurrencyPDF },
                { header: 'Intérêts', dataKey: 'interestDue', formatter: formatCurrencyPDF },
                { header: 'Total Dû', dataKey: 'totalDue', formatter: formatCurrencyPDF },
                { header: 'Total Payé', dataKey: 'totalPaid', formatter: formatCurrencyPDF },
                { header: 'Statut', dataKey: 'status' }
            ],
            data: filteredEcheanciers,
            filename: 'rapport_echeanciers.pdf',
            orientation: 'landscape',
            statistics: [
                { label: 'Total Échéances', value: filteredEcheanciers.length },
                { label: 'Total Dû', value: formatCurrency(totalDue) },
                { label: 'Total Payé', value: formatCurrency(totalPaid) },
                { label: 'Taux de Paiement', value: `${paymentRate}%` }
            ]
        });
    };

    const header = (
        <div className="flex flex-wrap gap-2 align-items-center justify-content-between">
            <h5 className="m-0">Liste des Échéanciers</h5>
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
                <i className="pi pi-calendar mr-2"></i>
                Rapport des Echeanciers
            </h2>

            <div className="surface-100 p-3 border-round mb-4">
                <h5 className="mb-3"><i className="pi pi-filter mr-2"></i>Filtres</h5>
                <div className="grid">
                    <div className="col-12 md:col-4">
                        <label className="font-semibold block mb-2">Période d'échéance</label>
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
                        <p className="text-500 m-0">Total Échéances</p>
                        <p className="text-2xl font-bold text-blue-700 m-0">{filteredEcheanciers.length}</p>
                    </div>
                </div>
                <div className="col-12 md:col-3">
                    <div className="bg-orange-100 p-3 border-round text-center">
                        <p className="text-500 m-0">Total Dû</p>
                        <p className="text-2xl font-bold text-orange-700 m-0">{formatCurrency(totalDue)}</p>
                    </div>
                </div>
                <div className="col-12 md:col-3">
                    <div className="bg-green-100 p-3 border-round text-center">
                        <p className="text-500 m-0">Total Payé</p>
                        <p className="text-2xl font-bold text-green-700 m-0">{formatCurrency(totalPaid)}</p>
                    </div>
                </div>
                <div className="col-12 md:col-3">
                    <div className="bg-purple-100 p-3 border-round text-center">
                        <p className="text-500 m-0">Taux de Paiement</p>
                        <p className="text-2xl font-bold text-purple-700 m-0">{paymentRate}%</p>
                    </div>
                </div>
            </div>

            <DataTable
                ref={dt}
                value={filteredEcheanciers}
                loading={loading}
                paginator
                rows={10}
                rowsPerPageOptions={[5, 10, 25, 50]}
                emptyMessage="Aucune échéance trouvée."
                stripedRows
                header={header}
                exportFilename="rapport_echeanciers"
                sortField="dueDate"
                sortOrder={-1}
                className="p-datatable-sm"
            >
                <Column field="loanId" header="N° Crédit" sortable />
                <Column field="installmentNumber" header="N° Échéance" sortable />
                <Column field="dueDate" header="Date Échéance" body={(row) => formatDate(row.dueDate)} sortable />
                <Column field="principalDue" header="Capital" body={(row) => formatCurrency(row.principalDue)} sortable />
                <Column field="interestDue" header="Intérêts" body={(row) => formatCurrency(row.interestDue)} />
                <Column field="totalDue" header="Total Dû" body={(row) => formatCurrency(row.totalDue)} sortable />
                <Column field="totalPaid" header="Total Payé" body={(row) => formatCurrency(row.totalPaid)} />
                <Column field="daysOverdue" header="Jours Retard" sortable />
                <Column field="status" header="Statut" body={statusBodyTemplate} sortable />
            </DataTable>
        </div>
    );
}
