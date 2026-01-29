'use client';

import React, { useState, useEffect, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { Toolbar } from 'primereact/toolbar';
import { Tag } from 'primereact/tag';
import { useSearchParams } from 'next/navigation';
import { LoanIncomeAnalysis } from './LoanIncomeAnalysis';
import { LoanIncomeAnalysisForm } from './LoanIncomeAnalysisForm';

export default function LoanIncomeAnalysisPage() {
    const [incomes, setIncomes] = useState<LoanIncomeAnalysis[]>([]);
    const [selectedIncomes, setSelectedIncomes] = useState<LoanIncomeAnalysis[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [editingIncome, setEditingIncome] = useState<LoanIncomeAnalysis | undefined>(undefined);
    const [loading, setLoading] = useState(false);
    const [globalFilter, setGlobalFilter] = useState('');
    const [totalMonthlyIncome, setTotalMonthlyIncome] = useState(0);
    const toast = useRef<Toast>(null);
    const searchParams = useSearchParams();
    const applicationId = Number(searchParams.get('applicationId')) || 0;

    useEffect(() => {
        if (applicationId) {
            loadIncomes();
        }
    }, [applicationId]);

    useEffect(() => {
        const total = incomes.reduce((sum, income) => sum + income.monthlyAmount, 0);
        setTotalMonthlyIncome(total);
    }, [incomes]);

    const loadIncomes = async () => {
        setLoading(true);
        try {
            const response = await fetch(`/api/financial-products/loan-applications/${applicationId}/income-analysis/`);
            const data = await response.json();
            setIncomes(data);
        } catch (error) {
            toast.current?.show({ severity: 'error', summary: 'Erreur', detail: 'Échec du chargement de income analysis' });
        } finally {
            setLoading(false);
        }
    };

    const openNew = () => {
        setEditingIncome(undefined);
        setShowForm(true);
    };

    const editIncome = (income: LoanIncomeAnalysis) => {
        setEditingIncome(income);
        setShowForm(true);
    };

    const saveIncome = async (income: LoanIncomeAnalysis) => {
        try {
            const url = income.id
                ? `/api/financial-products/loan-applications/${applicationId}/income-analysis/${income.id}/`
                : `/api/financial-products/loan-applications/${applicationId}/income-analysis/`;

            const response = await fetch(url, {
                method: income.id ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(income)
            });

            if (response.ok) {
                toast.current?.show({ severity: 'success', summary: 'Succès', detail: 'Income analysis saved successfully' });
                setShowForm(false);
                loadIncomes();
            }
        } catch (error) {
            toast.current?.show({ severity: 'error', summary: 'Erreur', detail: 'Échec de la sauvegarde de income analysis' });
        }
    };

    const deleteIncome = async (income: LoanIncomeAnalysis) => {
        if (confirm('Êtes-vous sûr de vouloir supprimer cette income entry?')) {
            try {
                const response = await fetch(`/api/financial-products/loan-applications/${applicationId}/income-analysis/${income.id}/`, {
                    method: 'DELETE'
                });

                if (response.ok) {
                    toast.current?.show({ severity: 'success', summary: 'Succès', detail: 'Income entry supprimé avec succès' });
                    loadIncomes();
                }
            } catch (error) {
                toast.current?.show({ severity: 'error', summary: 'Erreur', detail: 'Échec de la suppression de income entry' });
            }
        }
    };

    const verifyIncome = async (income: LoanIncomeAnalysis) => {
        try {
            const response = await fetch(`/api/financial-products/loan-applications/${applicationId}/income-analysis/${income.id}/verify/`, {
                method: 'POST'
            });

            if (response.ok) {
                toast.current?.show({ severity: 'success', summary: 'Succès', detail: 'Income verified successfully' });
                loadIncomes();
            }
        } catch (error) {
            toast.current?.show({ severity: 'error', summary: 'Erreur', detail: 'Failed to verify income' });
        }
    };

    const leftToolbarTemplate = () => {
        return (
            <div className="flex flex-wrap gap-2">
                <Button label="Add Income" icon="pi pi-plus" severity="success" onClick={openNew} />
            </div>
        );
    };

    const rightToolbarTemplate = () => {
        return (
            <div className="flex align-items-center gap-2">
                <span className="font-bold text-xl">
                    Total Monthly Income: {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(totalMonthlyIncome)}
                </span>
            </div>
        );
    };

    const amountBodyTemplate = (rowData: LoanIncomeAnalysis) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(rowData.monthlyAmount);
    };

    const verifiedBodyTemplate = (rowData: LoanIncomeAnalysis) => {
        return rowData.isVerified ? (
            <Tag value="Verified" severity="success" icon="pi pi-check" />
        ) : (
            <Tag value="Not Verified" severity="warning" icon="pi pi-clock" />
        );
    };

    const actionsBodyTemplate = (rowData: LoanIncomeAnalysis) => {
        return (
            <div className="flex flex-wrap gap-2">
                <Button
                    icon="pi pi-pencil"
                    rounded
                    outlined
                    className="mr-2"
                    onClick={() => editIncome(rowData)}
                />
                {!rowData.isVerified && (
                    <Button
                        icon="pi pi-check"
                        rounded
                        outlined
                        severity="success"
                        tooltip="Verify"
                        onClick={() => verifyIncome(rowData)}
                    />
                )}
                <Button
                    icon="pi pi-trash"
                    rounded
                    outlined
                    severity="danger"
                    onClick={() => deleteIncome(rowData)}
                />
            </div>
        );
    };

    const header = (
        <div className="flex flex-wrap gap-2 align-items-center justify-content-between">
            <h4 className="m-0">Income Analysis (Application #{applicationId})</h4>
            <span className="p-input-icon-left">
                <i className="pi pi-search" />
                <input
                    type="search"
                    placeholder="Rechercher..."
                    className="p-inputtext p-component"
                    onInput={(e: any) => setGlobalFilter(e.target.value)}
                />
            </span>
        </div>
    );

    return (
        <div className="card">
            <Toast ref={toast} />
            <Toolbar className="mb-4" left={leftToolbarTemplate} right={rightToolbarTemplate} />

            <DataTable
                value={incomes}
                selection={selectedIncomes}
                onSelectionChange={(e) => setSelectedIncomes(e.value as LoanIncomeAnalysis[])}
                dataKey="id"
                paginator
                rows={10}
                loading={loading}
                globalFilter={globalFilter}
                header={header}
                emptyMessage="No income entries found."
            >
                <Column selectionMode="multiple" exportable={false} />
                <Column field="incomeType.name" header="Income Type" sortable />
                <Column field="sourceDescription" header="Source Description" sortable />
                <Column field="monthlyAmount" header="Monthly Amount" body={amountBodyTemplate} sortable />
                <Column header="Verification Status" body={verifiedBodyTemplate} />
                <Column field="document.fileName" header="Supporting Document" sortable />
                <Column field="notes" header="Notes" />
                <Column header="Actions" body={actionsBodyTemplate} exportable={false} />
            </DataTable>

            <LoanIncomeAnalysisForm
                visible={showForm}
                income={editingIncome}
                applicationId={applicationId}
                onHide={() => setShowForm(false)}
                onSave={saveIncome}
            />
        </div>
    );
}
