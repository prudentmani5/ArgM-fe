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
import { exportToPDF, formatCurrency as formatCurrencyPDF } from '@/utils/pdfExport';

const BASE_URL = buildApiUrl('/api/credit/capacity-analysis');

const riskLevels = [
    { code: 'FAIBLE', name: 'Faible' },
    { code: 'MODERE', name: 'Modéré' },
    { code: 'ELEVE', name: 'Élevé' }
];

export default function RapportAnalysesPage() {
    const [analyses, setAnalyses] = useState<any[]>([]);
    const [branches, setBranches] = useState<any[]>([]);
    const [filters, setFilters] = useState<any>({
        dateRange: null,
        branchId: null,
        riskLevel: null
    });
    const toast = useRef<Toast>(null);
    const dt = useRef<DataTable<any[]>>(null);

    // Separate hook instances for each data type
    const analysesApi = useConsumApi('');
    const branchesApi = useConsumApi('');

    useEffect(() => {
        loadAnalyses();
        loadBranches();
    }, []);

    // Handle analyses data
    useEffect(() => {
        if (analysesApi.data) {
            const rawData = Array.isArray(analysesApi.data) ? analysesApi.data : analysesApi.data.content || [];
            // Map backend fields to frontend expected fields
            const mappedData = rawData.map((item: any) => ({
                ...item,
                applicationNumber: item.application?.applicationNumber || '-',
                clientName: item.application?.client
                    ? `${item.application.client.firstName || ''} ${item.application.client.lastName || ''}`.trim()
                    : '-',
                branchId: item.application?.branchId || item.application?.branch?.id,
                branchName: item.application?.branch?.name || '-',
                totalMonthlyIncome: item.grossMonthlyIncome || 0,
                totalMonthlyExpenses: item.grossMonthlyExpenses || 0,
                disposableIncome: item.availableIncome || 0,
                debtToIncomeRatio: item.newDebtRatio || 0,
                proposedInstallment: item.proposedPayment || 0,
                riskAssessment: getRiskAssessment(item.newDebtRatio),
                analystName: item.analyst ? `${item.analyst.firstName || ''} ${item.analyst.lastName || ''}`.trim() : '-'
            }));
            setAnalyses(mappedData);
        }
        if (analysesApi.error) {
            toast.current?.show({ severity: 'error', summary: 'Erreur', detail: analysesApi.error.message, life: 3000 });
        }
    }, [analysesApi.data, analysesApi.error]);

    // Handle branches data
    useEffect(() => {
        if (branchesApi.data) {
            setBranches(Array.isArray(branchesApi.data) ? branchesApi.data : branchesApi.data.content || []);
        }
    }, [branchesApi.data]);

    // Calculate risk assessment based on debt-to-income ratio
    const getRiskAssessment = (dti: number): string => {
        if (!dti || dti < 30) return 'FAIBLE';
        if (dti < 40) return 'MODERE';
        return 'ELEVE';
    };

    const loadAnalyses = () => {
        analysesApi.fetchData(null, 'GET', `${BASE_URL}/findall`, 'loadAnalyses');
    };

    const loadBranches = () => {
        branchesApi.fetchData(null, 'GET', buildApiUrl('/api/reference-data/branches/findall'), 'loadBranches');
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'BIF',
            minimumFractionDigits: 0
        }).format(value || 0);
    };

    const formatPercent = (value: number) => {
        return `${(value || 0).toFixed(1)}%`;
    };

    const exportCSV = () => {
        dt.current?.exportCSV();
    };

    const exportPdf = () => {
        exportToPDF({
            title: 'Rapport des Analyses Financières',
            columns: [
                { header: 'N° Dossier', dataKey: 'applicationNumber' },
                { header: 'Client', dataKey: 'clientName' },
                { header: 'Revenus Mensuels', dataKey: 'totalMonthlyIncome', formatter: formatCurrencyPDF },
                { header: 'Charges Mensuelles', dataKey: 'totalMonthlyExpenses', formatter: formatCurrencyPDF },
                { header: 'Revenu Disponible', dataKey: 'disposableIncome', formatter: formatCurrencyPDF },
                { header: 'Taux d\'endettement', dataKey: 'debtToIncomeRatio', formatter: formatPercent },
                { header: 'Évaluation Risque', dataKey: 'riskAssessment' },
                { header: 'Analyste', dataKey: 'analystName' }
            ],
            data: filteredAnalyses,
            filename: 'rapport_analyses_financieres.pdf',
            orientation: 'landscape',
            statistics: [
                { label: 'Total Analyses', value: filteredAnalyses.length },
                { label: 'Taux Moyen', value: formatPercent(avgDti) },
                { label: 'Revenu Moyen', value: formatCurrency(avgIncome) }
            ]
        });
    };

    const dtiTemplate = (rowData: any) => {
        const dti = rowData.debtToIncomeRatio || 0;
        let severity: 'success' | 'warning' | 'danger' = 'success';
        if (dti >= 30 && dti < 40) severity = 'warning';
        if (dti >= 40) severity = 'danger';
        return <Tag value={formatPercent(dti)} severity={severity} />;
    };

    const riskTemplate = (rowData: any) => {
        const colors: Record<string, string> = {
            'FAIBLE': 'success',
            'MODERE': 'warning',
            'ELEVE': 'danger'
        };
        return <Tag value={rowData.riskAssessment || 'Non évalué'} severity={colors[rowData.riskAssessment] as any || 'secondary'} />;
    };

    // Filter data based on filters
    const filteredAnalyses = analyses.filter((a: any) => {
        let match = true;
        if (filters.branchId) {
            match = match && a.branchId === filters.branchId;
        }
        if (filters.riskLevel) {
            match = match && a.riskAssessment === filters.riskLevel;
        }
        if (filters.dateRange && filters.dateRange[0]) {
            const analysisDate = new Date(a.analysisDate);
            match = match && analysisDate >= filters.dateRange[0];
            if (filters.dateRange[1]) {
                match = match && analysisDate <= filters.dateRange[1];
            }
        }
        return match;
    });

    // Calculate averages
    const avgDti = filteredAnalyses.length > 0
        ? filteredAnalyses.reduce((sum, a) => sum + (a.debtToIncomeRatio || 0), 0) / filteredAnalyses.length
        : 0;
    const avgIncome = filteredAnalyses.length > 0
        ? filteredAnalyses.reduce((sum, a) => sum + (a.totalMonthlyIncome || 0), 0) / filteredAnalyses.length
        : 0;

    const header = (
        <div className="flex flex-wrap gap-2 align-items-center justify-content-between">
            <h5 className="m-0">
                <i className="pi pi-chart-line mr-2"></i>
                Rapport des Analyses Financières
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
                        <label className="font-semibold block mb-2">Niveau de Risque</label>
                        <Dropdown
                            value={filters.riskLevel}
                            options={riskLevels}
                            onChange={(e) => setFilters({ ...filters, riskLevel: e.value })}
                            optionLabel="name"
                            optionValue="code"
                            placeholder="Tous les niveaux"
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
                        <p className="text-500 m-0">Analyses Effectuées</p>
                        <p className="text-2xl font-bold m-0">{filteredAnalyses.length}</p>
                    </div>
                </div>
                <div className="col-12 md:col-3">
                    <div className="surface-100 p-3 border-round text-center">
                        <p className="text-500 m-0">DTI Moyen</p>
                        <p className="text-2xl font-bold m-0">{formatPercent(avgDti)}</p>
                    </div>
                </div>
                <div className="col-12 md:col-3">
                    <div className="surface-100 p-3 border-round text-center">
                        <p className="text-500 m-0">Revenu Mensuel Moyen</p>
                        <p className="text-2xl font-bold m-0">{formatCurrency(avgIncome)}</p>
                    </div>
                </div>
                <div className="col-12 md:col-3">
                    <div className="surface-100 p-3 border-round text-center">
                        <p className="text-500 m-0">DTI {'<'} 30%</p>
                        <p className="text-2xl font-bold text-green-600 m-0">
                            {filteredAnalyses.filter(a => (a.debtToIncomeRatio || 0) < 30).length}
                        </p>
                    </div>
                </div>
            </div>

            <DataTable
                ref={dt}
                value={filteredAnalyses}
                paginator
                rows={10}
                rowsPerPageOptions={[5, 10, 25, 50]}
                loading={analysesApi.loading}
                header={header}
                emptyMessage="Aucune analyse trouvée"
                className="p-datatable-sm"
                exportFilename="rapport_analyses_financieres"
            >
                <Column field="applicationNumber" header="N° Dossier" sortable />
                <Column field="clientName" header="Client" sortable />
                <Column field="totalMonthlyIncome" header="Revenus Mensuels" body={(row) => formatCurrency(row.totalMonthlyIncome)} sortable />
                <Column field="totalMonthlyExpenses" header="Dépenses Mensuelles" body={(row) => formatCurrency(row.totalMonthlyExpenses)} sortable />
                <Column field="disposableIncome" header="Revenu Disponible" body={(row) => formatCurrency(row.disposableIncome)} sortable />
                <Column header="Ratio DTI" body={dtiTemplate} sortable field="debtToIncomeRatio" />
                <Column field="proposedInstallment" header="Mensualité Proposée" body={(row) => formatCurrency(row.proposedInstallment)} sortable />
                <Column header="Évaluation Risque" body={riskTemplate} />
                <Column field="analystName" header="Analyste" sortable />
                <Column field="userAction" header="Responsable" sortable />
            </DataTable>
        </div>
    );
}
