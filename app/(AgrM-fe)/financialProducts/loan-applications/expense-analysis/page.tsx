'use client';

import React, { useState, useEffect, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { Toolbar } from 'primereact/toolbar';
import { useSearchParams } from 'next/navigation';
import { LoanExpenseAnalysis } from './LoanExpenseAnalysis';
import { LoanExpenseAnalysisForm } from './LoanExpenseAnalysisForm';

export default function LoanExpenseAnalysisPage() {
    const [expenses, setExpenses] = useState<LoanExpenseAnalysis[]>([]);
    const [selectedExpenses, setSelectedExpenses] = useState<LoanExpenseAnalysis[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [editingExpense, setEditingExpense] = useState<LoanExpenseAnalysis | undefined>(undefined);
    const [loading, setLoading] = useState(false);
    const [globalFilter, setGlobalFilter] = useState('');
    const [totalMonthlyExpenses, setTotalMonthlyExpenses] = useState(0);
    const toast = useRef<Toast>(null);
    const searchParams = useSearchParams();
    const applicationId = Number(searchParams.get('applicationId')) || 0;

    useEffect(() => {
        if (applicationId) {
            loadExpenses();
        }
    }, [applicationId]);

    useEffect(() => {
        const total = expenses.reduce((sum, expense) => sum + expense.monthlyAmount, 0);
        setTotalMonthlyExpenses(total);
    }, [expenses]);

    const loadExpenses = async () => {
        setLoading(true);
        try {
            const response = await fetch(`/api/financial-products/loan-applications/${applicationId}/expense-analysis/`);
            const data = await response.json();
            setExpenses(data);
        } catch (error) {
            toast.current?.show({ severity: 'error', summary: 'Erreur', detail: 'Échec du chargement de expense analysis' });
        } finally {
            setLoading(false);
        }
    };

    const openNew = () => {
        setEditingExpense(undefined);
        setShowForm(true);
    };

    const editExpense = (expense: LoanExpenseAnalysis) => {
        setEditingExpense(expense);
        setShowForm(true);
    };

    const saveExpense = async (expense: LoanExpenseAnalysis) => {
        try {
            const url = expense.id
                ? `/api/financial-products/loan-applications/${applicationId}/expense-analysis/${expense.id}/`
                : `/api/financial-products/loan-applications/${applicationId}/expense-analysis/`;

            const response = await fetch(url, {
                method: expense.id ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(expense)
            });

            if (response.ok) {
                toast.current?.show({ severity: 'success', summary: 'Succès', detail: 'Expense analysis saved successfully' });
                setShowForm(false);
                loadExpenses();
            }
        } catch (error) {
            toast.current?.show({ severity: 'error', summary: 'Erreur', detail: 'Échec de la sauvegarde de expense analysis' });
        }
    };

    const deleteExpense = async (expense: LoanExpenseAnalysis) => {
        if (confirm('Êtes-vous sûr de vouloir supprimer cette expense entry?')) {
            try {
                const response = await fetch(`/api/financial-products/loan-applications/${applicationId}/expense-analysis/${expense.id}/`, {
                    method: 'DELETE'
                });

                if (response.ok) {
                    toast.current?.show({ severity: 'success', summary: 'Succès', detail: 'Expense entry supprimé avec succès' });
                    loadExpenses();
                }
            } catch (error) {
                toast.current?.show({ severity: 'error', summary: 'Erreur', detail: 'Échec de la suppression de expense entry' });
            }
        }
    };

    const leftToolbarTemplate = () => {
        return (
            <div className="flex flex-wrap gap-2">
                <Button label="Add Expense" icon="pi pi-plus" severity="success" onClick={openNew} />
            </div>
        );
    };

    const rightToolbarTemplate = () => {
        return (
            <div className="flex align-items-center gap-2">
                <span className="font-bold text-xl">
                    Total Monthly Expenses: {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(totalMonthlyExpenses)}
                </span>
            </div>
        );
    };

    const amountBodyTemplate = (rowData: LoanExpenseAnalysis) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(rowData.monthlyAmount);
    };

    const actionsBodyTemplate = (rowData: LoanExpenseAnalysis) => {
        return (
            <div className="flex flex-wrap gap-2">
                <Button
                    icon="pi pi-pencil"
                    rounded
                    outlined
                    className="mr-2"
                    onClick={() => editExpense(rowData)}
                />
                <Button
                    icon="pi pi-trash"
                    rounded
                    outlined
                    severity="danger"
                    onClick={() => deleteExpense(rowData)}
                />
            </div>
        );
    };

    const header = (
        <div className="flex flex-wrap gap-2 align-items-center justify-content-between">
            <h4 className="m-0">Expense Analysis (Application #{applicationId})</h4>
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
                value={expenses}
                selection={selectedExpenses}
                onSelectionChange={(e) => setSelectedExpenses(e.value as LoanExpenseAnalysis[])}
                dataKey="id"
                paginator
                rows={10}
                loading={loading}
                globalFilter={globalFilter}
                header={header}
                emptyMessage="No expense entries found."
            >
                <Column selectionMode="multiple" exportable={false} />
                <Column field="expenseType.name" header="Expense Type" sortable />
                <Column field="description" header="Description" sortable />
                <Column field="monthlyAmount" header="Monthly Amount" body={amountBodyTemplate} sortable />
                <Column field="notes" header="Notes" />
                <Column header="Actions" body={actionsBodyTemplate} exportable={false} />
            </DataTable>

            <LoanExpenseAnalysisForm
                visible={showForm}
                expense={editingExpense}
                applicationId={applicationId}
                onHide={() => setShowForm(false)}
                onSave={saveExpense}
            />
        </div>
    );
}
