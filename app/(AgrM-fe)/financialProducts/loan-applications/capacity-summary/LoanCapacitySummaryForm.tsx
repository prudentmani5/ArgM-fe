'use client';

import React, { useState, useEffect } from 'react';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { InputTextarea } from 'primereact/inputtextarea';
import { Button } from 'primereact/button';
import { ProgressBar } from 'primereact/progressbar';
import { LoanCapacitySummary } from './LoanCapacitySummary';

interface LoanCapacitySummaryFormProps {
    visible: boolean;
    summary?: LoanCapacitySummary;
    applicationId: number;
    onHide: () => void;
    onSave: (summary: LoanCapacitySummary) => void;
}

export const LoanCapacitySummaryForm: React.FC<LoanCapacitySummaryFormProps> = ({
    visible,
    summary,
    applicationId,
    onHide,
    onSave
}) => {
    const [formData, setFormData] = useState<LoanCapacitySummary>(new LoanCapacitySummary());

    const capacityAssessmentOptions = [
        { label: 'Excellent', value: 'EXCELLENT' },
        { label: 'Good', value: 'GOOD' },
        { label: 'Moderate', value: 'MODERATE' },
        { label: 'Weak', value: 'WEAK' },
        { label: 'Insufficient', value: 'INSUFFICIENT' }
    ];

    useEffect(() => {
        if (visible && summary) {
            setFormData(summary);
        }
    }, [visible, summary]);

    const handleSubmit = () => {
        onSave(formData);
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(value);
    };

    const getDTIColor = (ratio: number) => {
        if (ratio <= 30) return 'success';
        if (ratio <= 40) return 'info';
        if (ratio <= 50) return 'warning';
        return 'danger';
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
            style={{ width: '60vw' }}
            header="Loan Capacity Summary"
            modal
            footer={footer}
            onHide={onHide}
        >
            <div className="p-fluid">
                {/* Section 1: Income Summary */}
                <div className="mb-4">
                    <h5>Income Summary</h5>
                    <div className="p-3 bg-green-50 border-round">
                        <div className="flex justify-content-between align-items-center mb-2">
                            <span className="font-semibold">Total Monthly Income:</span>
                            <span className="text-xl font-bold text-green-700">
                                {formatCurrency(formData.totalMonthlyIncome)}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Section 2: Expense Summary */}
                <div className="mb-4">
                    <h5>Expense Summary</h5>
                    <div className="p-3 bg-red-50 border-round">
                        <div className="flex justify-content-between align-items-center mb-2">
                            <span className="font-semibold">Total Monthly Expenses:</span>
                            <span className="text-xl font-bold text-red-700">
                                {formatCurrency(formData.totalMonthlyExpenses)}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Section 3: Net Income */}
                <div className="mb-4">
                    <h5>Net Income</h5>
                    <div className="p-3 bg-blue-50 border-round">
                        <div className="flex justify-content-between align-items-center mb-2">
                            <span className="font-semibold">Net Monthly Income:</span>
                            <span className="text-xl font-bold text-blue-700">
                                {formatCurrency(formData.netMonthlyIncome)}
                            </span>
                        </div>
                        <small className="text-sm text-gray-600">
                            (Total Income - Total Expenses)
                        </small>
                    </div>
                </div>

                {/* Section 4: Capacity Metrics */}
                <div className="mb-4">
                    <h5>Capacity Metrics</h5>
                    <div className="p-3 bg-purple-50 border-round">
                        <div className="mb-3">
                            <div className="flex justify-content-between align-items-center mb-2">
                                <span className="font-semibold">Monthly Obligations:</span>
                                <span className="text-lg font-bold">
                                    {formatCurrency(formData.monthlyObligations)}
                                </span>
                            </div>
                        </div>
                        <div className="mb-3">
                            <div className="flex justify-content-between align-items-center mb-2">
                                <span className="font-semibold">Available Monthly Capacity:</span>
                                <span className="text-lg font-bold text-green-600">
                                    {formatCurrency(formData.availableMonthlyCapacity)}
                                </span>
                            </div>
                        </div>
                        <div className="mb-3">
                            <div className="flex justify-content-between align-items-center mb-2">
                                <span className="font-semibold">Proposed Monthly Payment:</span>
                                <span className="text-lg font-bold text-orange-600">
                                    {formatCurrency(formData.proposedMonthlyPayment)}
                                </span>
                            </div>
                        </div>
                        <div className="mb-2">
                            <div className="flex justify-content-between align-items-center mb-2">
                                <span className="font-semibold">Debt-to-Income Ratio:</span>
                                <span className="text-lg font-bold">
                                    {formData.debtToIncomeRatio.toFixed(2)}%
                                </span>
                            </div>
                            <ProgressBar
                                value={formData.debtToIncomeRatio}
                                showValue={false}
                                color={getDTIColor(formData.debtToIncomeRatio)}
                            />
                            <div className="flex justify-content-between mt-1">
                                <small className="text-green-600">Excellent (&lt;30%)</small>
                                <small className="text-blue-600">Good (30-40%)</small>
                                <small className="text-orange-600">Moderate (40-50%)</small>
                                <small className="text-red-600">High (&gt;50%)</small>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Section 5: Assessment */}
                <div className="mb-4">
                    <h5>Capacity Assessment</h5>
                    <div className="field">
                        <label htmlFor="capacityAssessment">Assessment *</label>
                        <Dropdown
                            id="capacityAssessment"
                            value={formData.capacityAssessment}
                            options={capacityAssessmentOptions}
                            onChange={(e) => setFormData({ ...formData, capacityAssessment: e.value })}
                            placeholder="Select Assessment"
                            required
                        />
                    </div>
                </div>

                {/* Section 6: Notes */}
                <div className="mb-4">
                    <h5>Analysis Notes</h5>
                    <div className="field">
                        <label htmlFor="analysisNotes">Notes</label>
                        <InputTextarea
                            id="analysisNotes"
                            value={formData.analysisNotes || ''}
                            onChange={(e) => setFormData({ ...formData, analysisNotes: e.target.value })}
                            rows={4}
                            placeholder="Analysis notes and comments..."
                        />
                    </div>
                </div>
            </div>
        </Dialog>
    );
};
