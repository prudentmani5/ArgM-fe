'use client';

import React, { useState, useEffect, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Calendar } from 'primereact/calendar';
import { Toast } from 'primereact/toast';
import { Tag } from 'primereact/tag';
import useConsumApi from '../../../../../hooks/fetchData/useConsumApi';
import { buildApiUrl } from '../../../../../utils/apiConfig';
import { exportToPDF, formatCurrency as formatCurrencyPDF, formatDate as formatDatePDF } from '../../../../../utils/pdfExport';

export default function RapportPrelevementsAutomatiquesPage() {
    const [batches, setBatches] = useState<any[]>([]);
    const [filters, setFilters] = useState<any>({
        dateRange: null
    });
    const toast = useRef<Toast>(null);
    const dt = useRef<DataTable<any[]>>(null);

    const { data, loading, error, fetchData } = useConsumApi('');
    const BASE_URL = buildApiUrl('/api/remboursement/automatic-payments');

    useEffect(() => {
        loadBatches();
    }, []);

    useEffect(() => {
        if (data) {
            const content = data.content || [];
            setBatches(Array.isArray(data) ? data : content);
        }
        if (error) {
            toast.current?.show({ severity: 'error', summary: 'Erreur', detail: error.message || 'Une erreur est survenue', life: 3000 });
        }
    }, [data, error]);

    const loadBatches = () => {
        fetchData(null, 'GET', `${BASE_URL}/history`, 'loadBatches');
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
    const filteredBatches = batches.filter((b: any) => {
        let match = true;
        if (filters.dateRange && filters.dateRange[0]) {
            const procDate = new Date(b.processingDate);
            match = match && procDate >= filters.dateRange[0];
            if (filters.dateRange[1]) {
                match = match && procDate <= filters.dateRange[1];
            }
        }
        return match;
    });

    // Statistics
    const totalProcessed = filteredBatches.reduce((sum, b) => sum + (b.totalSchedulesProcessed || 0), 0);
    const totalSuccess = filteredBatches.reduce((sum, b) => sum + (b.successCount || 0), 0);
    const totalFailed = filteredBatches.reduce((sum, b) => sum + (b.failedCount || 0), 0);
    const totalAmount = filteredBatches.reduce((sum, b) => sum + (b.totalAmountProcessed || 0), 0);
    const successRate = totalProcessed > 0 ? Math.round((totalSuccess / totalProcessed) * 100) : 0;

    const statusBodyTemplate = (rowData: any) => {
        const labels: Record<string, string> = { 'PROCESSING': 'En cours', 'COMPLETED': 'Terminé', 'FAILED': 'Échoué', 'PARTIAL': 'Partiel' };
        const severities: Record<string, any> = { 'PROCESSING': 'info', 'COMPLETED': 'success', 'FAILED': 'danger', 'PARTIAL': 'warning' };
        return <Tag value={labels[rowData.status] || rowData.status} severity={severities[rowData.status] || 'secondary'} />;
    };

    const exportCSV = () => {
        dt.current?.exportCSV();
    };

    const exportPdf = () => {
        exportToPDF({
            title: 'Rapport des Prélèvements Automatiques',
            columns: [
                { header: 'N° Lot', dataKey: 'batchNumber' },
                { header: 'Date Traitement', dataKey: 'processingDate', formatter: formatDatePDF },
                { header: 'Total Traités', dataKey: 'totalSchedulesProcessed' },
                { header: 'Réussis', dataKey: 'successCount' },
                { header: 'Échoués', dataKey: 'failedCount' },
                { header: 'Solde Insuffisant', dataKey: 'insufficientBalanceCount' },
                { header: 'Montant Traité', dataKey: 'totalAmountProcessed', formatter: formatCurrencyPDF },
                { header: 'Statut', dataKey: 'status' }
            ],
            data: filteredBatches,
            filename: 'rapport_prelevements_automatiques.pdf',
            orientation: 'landscape',
            statistics: [
                { label: 'Total Lots', value: filteredBatches.length },
                { label: 'Total Traités', value: totalProcessed },
                { label: 'Taux de Réussite', value: `${successRate}%` },
                { label: 'Montant Total', value: formatCurrency(totalAmount) }
            ]
        });
    };

    const header = (
        <div className="flex flex-wrap gap-2 align-items-center justify-content-between">
            <h5 className="m-0">Historique des Prélèvements Automatiques</h5>
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
                <i className="pi pi-sync mr-2"></i>
                Rapport des Prélèvements Automatiques
            </h2>

            <div className="surface-100 p-3 border-round mb-4">
                <h5 className="mb-3"><i className="pi pi-filter mr-2"></i>Filtres</h5>
                <div className="grid">
                    <div className="col-12 md:col-4">
                        <label className="font-semibold block mb-2">Période de traitement</label>
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
                </div>
            </div>

            <div className="grid mb-4">
                <div className="col-12 md:col-3">
                    <div className="bg-blue-100 p-3 border-round text-center">
                        <p className="text-500 m-0">Total Lots</p>
                        <p className="text-2xl font-bold text-blue-700 m-0">{filteredBatches.length}</p>
                    </div>
                </div>
                <div className="col-12 md:col-3">
                    <div className="bg-green-100 p-3 border-round text-center">
                        <p className="text-500 m-0">Réussis</p>
                        <p className="text-2xl font-bold text-green-700 m-0">{totalSuccess}</p>
                    </div>
                </div>
                <div className="col-12 md:col-3">
                    <div className="bg-red-100 p-3 border-round text-center">
                        <p className="text-500 m-0">Échoués</p>
                        <p className="text-2xl font-bold text-red-700 m-0">{totalFailed}</p>
                    </div>
                </div>
                <div className="col-12 md:col-3">
                    <div className="bg-purple-100 p-3 border-round text-center">
                        <p className="text-500 m-0">Montant Total</p>
                        <p className="text-2xl font-bold text-purple-700 m-0">{formatCurrency(totalAmount)}</p>
                    </div>
                </div>
            </div>

            <DataTable
                ref={dt}
                value={filteredBatches}
                loading={loading}
                paginator
                rows={10}
                rowsPerPageOptions={[5, 10, 25, 50]}
                emptyMessage="Aucun prélèvement trouvé."
                stripedRows
                header={header}
                exportFilename="rapport_prelevements_automatiques"
                sortField="processingDate"
                sortOrder={-1}
                className="p-datatable-sm"
            >
                <Column field="batchNumber" header="N° Lot" sortable />
                <Column field="processingDate" header="Date Traitement" body={(row) => formatDate(row.processingDate)} sortable />
                <Column field="totalSchedulesProcessed" header="Total Traités" sortable />
                <Column field="successCount" header="Réussis" sortable />
                <Column field="failedCount" header="Échoués" sortable />
                <Column field="insufficientBalanceCount" header="Solde Insuffisant" sortable />
                <Column field="totalAmountProcessed" header="Montant Traité" body={(row) => formatCurrency(row.totalAmountProcessed)} sortable />
                <Column field="status" header="Statut" body={statusBodyTemplate} sortable />
                <Column field="executedBy" header="Exécuté par" sortable />
            </DataTable>
        </div>
    );
}
