'use client';

import React, { useState, useEffect, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { Tag } from 'primereact/tag';
import { Calendar } from 'primereact/calendar';
import { buildApiUrl } from '@/utils/apiConfig';
import useConsumApi from '@/hooks/fetchData/useConsumApi';

const BASE_URL = buildApiUrl('/api/credit/financial-analyses');

export default function RapportAnalysesPage() {
    const [analyses, setAnalyses] = useState<any[]>([]);
    const [dateRange, setDateRange] = useState<Date[] | null>(null);
    const toast = useRef<Toast>(null);
    const dt = useRef<DataTable<any[]>>(null);

    const { data, loading, error, fetchData, callType } = useConsumApi('');

    useEffect(() => {
        loadAnalyses();
    }, []);

    useEffect(() => {
        if (data && callType === 'loadAnalyses') {
            setAnalyses(Array.isArray(data) ? data : data.content || []);
        }
        if (error) {
            toast.current?.show({ severity: 'error', summary: 'Erreur', detail: error.message, life: 3000 });
        }
    }, [data, error, callType]);

    const loadAnalyses = () => {
        fetchData(null, 'GET', `${BASE_URL}/findall`, 'loadAnalyses');
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

    // Filter by date range
    const filteredAnalyses = analyses.filter((a: any) => {
        if (!dateRange || !dateRange[0]) return true;
        const analysisDate = new Date(a.analysisDate);
        if (dateRange[1]) {
            return analysisDate >= dateRange[0] && analysisDate <= dateRange[1];
        }
        return analysisDate >= dateRange[0];
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
            <div className="flex gap-2 align-items-center">
                <Calendar
                    value={dateRange}
                    onChange={(e) => setDateRange(e.value as Date[])}
                    selectionMode="range"
                    placeholder="Période"
                    dateFormat="dd/mm/yy"
                    showIcon
                    className="w-15rem"
                />
                <Button label="Exporter" icon="pi pi-file-excel" severity="success" onClick={exportCSV} />
            </div>
        </div>
    );

    return (
        <div className="card">
            <Toast ref={toast} />

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
                loading={loading}
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
            </DataTable>
        </div>
    );
}
