'use client';

import React, { useState, useEffect, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { Toast } from 'primereact/toast';
import { Tag } from 'primereact/tag';
import useConsumApi from '../../../../../hooks/fetchData/useConsumApi';
import { buildApiUrl } from '../../../../../utils/apiConfig';
import { exportToPDF, formatCurrency as formatCurrencyPDF, formatDate as formatDatePDF } from '../../../../../utils/pdfExport';

const CLASSIFICATIONS = [
    { label: 'Normal (1-30 jours)', value: 'NORMAL' },
    { label: 'A surveiller (31-60 jours)', value: 'WATCH' },
    { label: 'Douteux (61-90 jours)', value: 'DOUBTFUL' },
    { label: 'Contentieux (>90 jours)', value: 'LITIGATION' }
];

export default function RapportRetardsPage() {
    const [retards, setRetards] = useState<any[]>([]);
    const [classificationFilter, setClassificationFilter] = useState<string | null>(null);
    const toast = useRef<Toast>(null);
    const dt = useRef<DataTable<any[]>>(null);

    const { data, loading, error, fetchData } = useConsumApi('');
    const BASE_URL = buildApiUrl('/api/remboursement/schedules');

    useEffect(() => {
        loadRetards();
    }, []);

    useEffect(() => {
        if (data) {
            setRetards(Array.isArray(data) ? data : data.content || []);
        }
        if (error) {
            toast.current?.show({ severity: 'error', summary: 'Erreur', detail: error.message || 'Une erreur est survenue', life: 3000 });
        }
    }, [data, error]);

    const loadRetards = () => {
        fetchData(null, 'GET', `${BASE_URL}/findoverdue`, 'loadRetards');
    };

    const formatCurrency = (value: number) => {
        if (!value && value !== 0) return '-';
        return new Intl.NumberFormat('fr-FR', { style: 'decimal', minimumFractionDigits: 0 }).format(value) + ' BIF';
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('fr-FR');
    };

    const getClassificationCode = (row: any): string => {
        const lc = row.lateClassification;
        if (!lc) {
            const days = row.daysOverdue || 0;
            if (days > 90) return 'LITIGATION';
            if (days > 60) return 'DOUBTFUL';
            if (days > 30) return 'WATCH';
            return 'NORMAL';
        }
        if (typeof lc === 'object') return lc.code || lc.name || 'NORMAL';
        return lc;
    };

    const getClassificationLabel = (code: string): string => {
        const labels: Record<string, string> = {
            'NORMAL': 'Normal',
            'WATCH': 'A surveiller',
            'DOUBTFUL': 'Douteux',
            'LITIGATION': 'Contentieux'
        };
        return labels[code] || code;
    };

    // Client-side filtering
    const filteredRetards = retards.filter((r: any) => {
        if (classificationFilter) {
            return getClassificationCode(r) === classificationFilter;
        }
        return true;
    });

    // Statistics
    const totalDue = filteredRetards.reduce((sum, r) => sum + (r.totalDue || 0) - (r.totalPaid || 0), 0);
    const totalPenalties = filteredRetards.reduce((sum, r) => sum + (r.penaltyAccrued || 0), 0);
    const avgDays = filteredRetards.length > 0
        ? Math.round(filteredRetards.reduce((sum, r) => sum + (r.daysOverdue || 0), 0) / filteredRetards.length)
        : 0;

    const daysBodyTemplate = (rowData: any) => {
        const days = rowData.daysOverdue || 0;
        let severity: any = 'success';
        if (days > 90) severity = 'danger';
        else if (days > 60) severity = 'warning';
        else if (days > 30) severity = 'info';
        return <Tag value={`${days} jours`} severity={severity} />;
    };

    const classificationBodyTemplate = (rowData: any) => {
        const code = getClassificationCode(rowData);
        const severities: Record<string, any> = {
            'LITIGATION': 'danger',
            'DOUBTFUL': 'warning',
            'WATCH': 'info',
            'NORMAL': 'success'
        };
        return <Tag value={getClassificationLabel(code)} severity={severities[code] || 'success'} />;
    };

    const statusBodyTemplate = (rowData: any) => {
        const labels: Record<string, string> = { 'OVERDUE': 'En retard', 'PARTIAL': 'Partiel', 'PENDING': 'En attente' };
        const severities: Record<string, any> = { 'OVERDUE': 'danger', 'PARTIAL': 'warning', 'PENDING': 'info' };
        return <Tag value={labels[rowData.status] || rowData.status} severity={severities[rowData.status] || 'secondary'} />;
    };

    const exportCSV = () => {
        dt.current?.exportCSV();
    };

    const exportPdf = () => {
        exportToPDF({
            title: 'Rapport des Retards de Paiement',
            columns: [
                { header: 'N° Crédit', dataKey: 'loanId' },
                { header: 'Date Échéance', dataKey: 'dueDate', formatter: formatDatePDF },
                { header: 'Jours Retard', dataKey: 'daysOverdue' },
                { header: 'Total Dû', dataKey: 'totalDue', formatter: formatCurrencyPDF },
                { header: 'Total Payé', dataKey: 'totalPaid', formatter: formatCurrencyPDF },
                { header: 'Pénalité', dataKey: 'penaltyAccrued', formatter: formatCurrencyPDF },
                { header: 'Statut', dataKey: 'status' }
            ],
            data: filteredRetards,
            filename: 'rapport_retards.pdf',
            orientation: 'landscape',
            statistics: [
                { label: 'Crédits en Retard', value: filteredRetards.length },
                { label: 'Total Impayés', value: formatCurrency(totalDue) },
                { label: 'Total Pénalités', value: formatCurrency(totalPenalties) },
                { label: 'Retard Moyen', value: `${avgDays} jours` }
            ]
        });
    };

    const header = (
        <div className="flex flex-wrap gap-2 align-items-center justify-content-between">
            <h5 className="m-0">Liste des Crédits en Retard</h5>
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
                <i className="pi pi-exclamation-triangle mr-2"></i>
                Rapport des Retards de Paiement
            </h2>

            <div className="surface-100 p-3 border-round mb-4">
                <h5 className="mb-3"><i className="pi pi-filter mr-2"></i>Filtres</h5>
                <div className="grid">
                    <div className="col-12 md:col-4">
                        <label className="font-semibold block mb-2">Classification</label>
                        <Dropdown
                            value={classificationFilter}
                            options={CLASSIFICATIONS}
                            onChange={(e) => setClassificationFilter(e.value)}
                            optionLabel="label"
                            optionValue="value"
                            placeholder="Toutes les classifications"
                            className="w-full"
                            showClear
                        />
                    </div>
                </div>
            </div>

            <div className="grid mb-4">
                <div className="col-12 md:col-3">
                    <div className="bg-red-100 p-3 border-round text-center">
                        <p className="text-500 m-0">Crédits en Retard</p>
                        <p className="text-2xl font-bold text-red-700 m-0">{filteredRetards.length}</p>
                    </div>
                </div>
                <div className="col-12 md:col-3">
                    <div className="bg-orange-100 p-3 border-round text-center">
                        <p className="text-500 m-0">Total Impayés</p>
                        <p className="text-2xl font-bold text-orange-700 m-0">{formatCurrency(totalDue)}</p>
                    </div>
                </div>
                <div className="col-12 md:col-3">
                    <div className="bg-purple-100 p-3 border-round text-center">
                        <p className="text-500 m-0">Total Pénalités</p>
                        <p className="text-2xl font-bold text-purple-700 m-0">{formatCurrency(totalPenalties)}</p>
                    </div>
                </div>
                <div className="col-12 md:col-3">
                    <div className="bg-blue-100 p-3 border-round text-center">
                        <p className="text-500 m-0">Retard Moyen</p>
                        <p className="text-2xl font-bold text-blue-700 m-0">{avgDays} jours</p>
                    </div>
                </div>
            </div>

            <DataTable
                ref={dt}
                value={filteredRetards}
                loading={loading}
                paginator
                rows={10}
                rowsPerPageOptions={[5, 10, 25, 50]}
                emptyMessage="Aucun retard trouvé."
                stripedRows
                header={header}
                exportFilename="rapport_retards"
                sortField="daysOverdue"
                sortOrder={-1}
                className="p-datatable-sm"
            >
                <Column field="loanId" header="N° Crédit" sortable />
                <Column field="installmentNumber" header="N° Échéance" sortable />
                <Column field="dueDate" header="Date Échéance" body={(row) => formatDate(row.dueDate)} sortable />
                <Column field="daysOverdue" header="Jours Retard" body={daysBodyTemplate} sortable />
                <Column field="totalDue" header="Total Dû" body={(row) => formatCurrency(row.totalDue)} sortable />
                <Column field="totalPaid" header="Total Payé" body={(row) => formatCurrency(row.totalPaid)} />
                <Column field="penaltyAccrued" header="Pénalité" body={(row) => formatCurrency(row.penaltyAccrued)} sortable />
                <Column header="Classification" body={classificationBodyTemplate} />
                <Column field="status" header="Statut" body={statusBodyTemplate} sortable />
            </DataTable>
        </div>
    );
}
