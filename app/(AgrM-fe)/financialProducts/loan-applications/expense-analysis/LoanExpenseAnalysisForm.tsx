'use client';

import React, { useState, useEffect } from 'react';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { InputNumber } from 'primereact/inputnumber';
import { InputTextarea } from 'primereact/inputtextarea';
import { Button } from 'primereact/button';
import { LoanExpenseAnalysis } from './LoanExpenseAnalysis';

interface LoanExpenseAnalysisFormProps {
    visible: boolean;
    expense?: LoanExpenseAnalysis;
    applicationId: number;
    onHide: () => void;
    onSave: (expense: LoanExpenseAnalysis) => void;
}

export const LoanExpenseAnalysisForm: React.FC<LoanExpenseAnalysisFormProps> = ({
    visible,
    expense,
    applicationId,
    onHide,
    onSave
}) => {
    const [formData, setFormData] = useState<LoanExpenseAnalysis>(new LoanExpenseAnalysis());
    const [expenseTypes, setExpenseTypes] = useState<any[]>([]);

    useEffect(() => {
        if (visible) {
            if (expense) {
                setFormData(expense);
            } else {
                const newExpense = new LoanExpenseAnalysis();
                newExpense.applicationId = applicationId;
                setFormData(newExpense);
            }
            loadExpenseTypes();
        }
    }, [visible, expense, applicationId]);

    const loadExpenseTypes = async () => {
        try {
            const response = await fetch('/api/financial-products/reference/expense-types/');
            const data = await response.json();
            setExpenseTypes(data);
        } catch (error) {
            console.error('Error loading expense types:', error);
        }
    };

    const handleSubmit = () => {
        onSave(formData);
    };

    const footer = (
        <div>
            <Button label="Annuler" icon="pi pi-times" onClick={onHide} className="p-button-text" />
            <Button label="Enregistrer" icon="pi pi-check" onClick={handleSubmit} autoFocus />
        </div>
    );

    return (
        <Dialog
            visible={visible}
            style={{ width: '50vw' }}
            header={expense?.id ? 'Edit Expense Analysis' : 'New Expense Analysis'}
            modal
            footer={footer}
            onHide={onHide}
        >
            <div className="p-fluid">
                <div className="field">
                    <label htmlFor="expenseTypeId">Expense Type *</label>
                    <Dropdown
                        id="expenseTypeId"
                        value={formData.expenseTypeId}
                        options={expenseTypes}
                        onChange={(e) => setFormData({ ...formData, expenseTypeId: e.value })}
                        optionLabel="name"
                        optionValue="id"
                        placeholder="Select Expense Type"
                        filter
                        required
                    />
                </div>

                <div className="field">
                    <label htmlFor="monthlyAmount">Monthly Amount *</label>
                    <InputNumber
                        id="monthlyAmount"
                        value={formData.monthlyAmount}
                        onValueChange={(e) => setFormData({ ...formData, monthlyAmount: e.value || 0 })}
                        mode="currency"
                        currency="USD"
                        locale="en-US"
                        required
                    />
                </div>

                <div className="field">
                    <label htmlFor="description">Description</label>
                    <InputTextarea
                        id="description"
                        value={formData.description || ''}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        rows={3}
                        placeholder="Describe the expense..."
                    />
                </div>

                <div className="field">
                    <label htmlFor="notes">Notes</label>
                    <InputTextarea
                        id="notes"
                        value={formData.notes || ''}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        rows={3}
                        placeholder="Additional notes..."
                    />
                </div>
            </div>
        </Dialog>
    );
};
