'use client';

import React, { useState, useEffect, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Calendar } from 'primereact/calendar';
import { Toast } from 'primereact/toast';
import useConsumApi from '../../../../../hooks/fetchData/useConsumApi';
import { buildApiUrl } from '../../../../../utils/apiConfig';
import { exportToPDF, formatCurrency as formatCurrencyPDF, formatDate as formatDatePDF } from '../../../../../utils/pdfExport';

export default function RapportPenalitesPage() {
    const [penalites, setPenalites] = useState<any[]>([]);
    const [filters, setFilters] = useState<any>({
        dateRange: null
    });
    const toast = useRef<Toast>(null);
    const dt = useRef<DataTable<any[]>>(null);

    const { data, loading, error, fetchData } = useConsumApi('');
    const BASE_URL = buildApiUrl('/api/remboursement/penalty-calculations');

    useEffect(() => {
        loadPenalites();
    }, []);

    useEffect(() => {
        if (data) {
            setPenalites(Array.isArray(data) ? data : data.content || []);
        }
        if (error) {
            toast.current?.show({ severity: 'error', summary: 'Erreur', detail: error.message || 'Une erreur est survenue', life: 3000 });
        }
    }, [data, error]);

    const loadPenalites = () => {
        fetchData(null, 'GET', `${BASE_URL}/findall`, 'loadPenalites');
    };

    const formatCurrency = (value: number) => {
        if (!value && value !== 0) return '-';
        return new Intl.NumberFormat('fr-FR', { style: 'decimal', minimumFractionDigits: 0 }).format(value) + ' BIF';
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('fr-FR');
    };

    const formatPercent = (value: number) => {
        if (!value && value !== 0) return '-';
        return `${value}%`;
    };

    // Client-side filtering
    const filteredPenalites = penalites.filter((p: any) => {
        let match = true;
        if (filters.dateRange && filters.dateRange[0]) {
            const calcDate = new Date(p.calculationDate);
            match = match && calcDate >= filters.dateRange[0];
            if (filters.dateRange[1]) {
                match = match && calcDate <= filters.dateRange[1];
            }
        }
        return match;
    });

    // Statistics
    const totalPenaltyRaw = filteredPenalites.reduce((sum, p) => sum + (p.penaltyAmountRaw || 0), 0);
    const totalPenaltyCapped = filteredPenalites.reduce((sum, p) => sum + (p.penaltyAmountCapped || 0), 0);
    const totalOverdue = filteredPenalites.reduce((sum, p) => sum + (p.totalOverdue || 0), 0);
    const avgDays = filteredPenalites.length > 0
        ? Math.round(filteredPenalites.reduce((sum, p) => sum + (p.daysOverdue || 0), 0) / filteredPenalites.length)
        : 0;

    const exportCSV = () => {
        dt.current?.exportCSV();
    };

    const exportPdf = () => {
        exportToPDF({
            title: 'Rapport des Pénalités',
            columns: [
                { header: 'N° Crédit', dataKey: 'loanId' },
                { header: 'Date Calcul', dataKey: 'calculationDate', formatter: formatDatePDF },
                { header: 'Jours Retard', dataKey: 'daysOverdue' },
                { header: 'Montant Retard', dataKey: 'totalOverdue', formatter: formatCurrencyPDF },
                { header: 'Taux Journalier', dataKey: 'penaltyRateDaily' },
                { header: 'Pénalité Brute', dataKey: 'penaltyAmountRaw', formatter: formatCurrencyPDF },
                { header: 'Plafond', dataKey: 'penaltyCap', formatter: formatCurrencyPDF },
                { header: 'Pénalité Finale', dataKey: 'penaltyAmountCapped', formatter: formatCurrencyPDF }
            ],
            data: filteredPenalites,
            filename: 'rapport_penalites.pdf',
            orientation: 'landscape',
            statistics: [
                { label: 'Total Calculs', value: filteredPenalites.length },
                { label: 'Total Pénalités (brut)', value: formatCurrency(totalPenaltyRaw) },
                { label: 'Total Pénalités (plafonné)', value: formatCurrency(totalPenaltyCapped) },
                { label: 'Retard Moyen', value: `${avgDays} jours` }
            ]
        });
    };

    const header = (
        <div className="flex flex-wrap gap-2 align-items-center justify-content-between">
            <h5 className="m-0">Calculs de Pénalités</h5>
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
                <i className="pi pi-calculator mr-2"></i>
                Rapport des Pénalités
            </h2>

            <div className="surface-100 p-3 border-round mb-4">
                <h5 className="mb-3"><i className="pi pi-filter mr-2"></i>Filtres</h5>
                <div className="grid">
                    <div className="col-12 md:col-4">
                        <label className="font-semibold block mb-2">Période de calcul</label>
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
                        <p className="text-500 m-0">Total Calculs</p>
                        <p className="text-2xl font-bold text-blue-700 m-0">{filteredPenalites.length}</p>
                    </div>
                </div>
                <div className="col-12 md:col-3">
                    <div className="bg-orange-100 p-3 border-round text-center">
                        <p className="text-500 m-0">Pénalités (brut)</p>
                        <p className="text-2xl font-bold text-orange-700 m-0">{formatCurrency(totalPenaltyRaw)}</p>
                    </div>
                </div>
                <div className="col-12 md:col-3">
                    <div className="bg-red-100 p-3 border-round text-center">
                        <p className="text-500 m-0">Pénalités (plafonné)</p>
                        <p className="text-2xl font-bold text-red-700 m-0">{formatCurrency(totalPenaltyCapped)}</p>
                    </div>
                </div>
                <div className="col-12 md:col-3">
                    <div className="bg-purple-100 p-3 border-round text-center">
                        <p className="text-500 m-0">Retard Moyen</p>
                        <p className="text-2xl font-bold text-purple-700 m-0">{avgDays} jours</p>
                    </div>
                </div>
            </div>

            <DataTable
                ref={dt}
                value={filteredPenalites}
                loading={loading}
                paginator
                rows={10}
                rowsPerPageOptions={[5, 10, 25, 50]}
                emptyMessage="Aucun calcul de pénalité trouvé."
                stripedRows
                header={header}
                exportFilename="rapport_penalites"
                sortField="calculationDate"
                sortOrder={-1}
                className="p-datatable-sm"
            >
                <Column field="loanId" header="N° Crédit" sortable />
                <Column field="calculationDate" header="Date Calcul" body={(row) => formatDate(row.calculationDate)} sortable />
                <Column field="daysOverdue" header="Jours Retard" sortable />
                <Column field="totalOverdue" header="Montant Retard" body={(row) => formatCurrency(row.totalOverdue)} sortable />
                <Column field="penaltyRateDaily" header="Taux Jour." body={(row) => formatPercent(row.penaltyRateDaily)} />
                <Column field="penaltyAmountRaw" header="Pénalité Brute" body={(row) => formatCurrency(row.penaltyAmountRaw)} sortable />
                <Column field="penaltyCap" header="Plafond" body={(row) => formatCurrency(row.penaltyCap)} />
                <Column field="penaltyAmountCapped" header="Pénalité Finale" body={(row) => formatCurrency(row.penaltyAmountCapped)} sortable />
            </DataTable>
        </div>
    );
}
