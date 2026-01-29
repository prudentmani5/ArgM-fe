'use client';

import React, { useState, useEffect } from 'react';
import { Dialog } from 'primereact/dialog';
import { InputNumber } from 'primereact/inputnumber';
import { Dropdown } from 'primereact/dropdown';
import { InputTextarea } from 'primereact/inputtextarea';
import { Button } from 'primereact/button';
import { ProgressBar } from 'primereact/progressbar';
import { LoanRiskAssessment } from './LoanRiskAssessment';

interface LoanRiskAssessmentFormProps {
    visible: boolean;
    assessment?: LoanRiskAssessment;
    applicationId: number;
    onHide: () => void;
    onSave: (assessment: LoanRiskAssessment) => void;
}

export const LoanRiskAssessmentForm: React.FC<LoanRiskAssessmentFormProps> = ({
    visible,
    assessment,
    applicationId,
    onHide,
    onSave
}) => {
    const [formData, setFormData] = useState<LoanRiskAssessment>(new LoanRiskAssessment());
    const [riskLevels, setRiskLevels] = useState<any[]>([]);

    useEffect(() => {
        if (visible) {
            if (assessment) {
                setFormData(assessment);
            } else {
                const newAssessment = new LoanRiskAssessment();
                newAssessment.applicationId = applicationId;
                setFormData(newAssessment);
            }
            loadRiskLevels();
        }
    }, [visible, assessment, applicationId]);

    useEffect(() => {
        // Auto-calculate total risk score
        const total = formData.characterScore + formData.capacityScore + formData.capitalScore +
            formData.collateralScore + formData.conditionsScore;
        setFormData(prev => ({ ...prev, totalRiskScore: total }));
    }, [formData.characterScore, formData.capacityScore, formData.capitalScore,
        formData.collateralScore, formData.conditionsScore]);

    const loadRiskLevels = async () => {
        try {
            const response = await fetch('/api/financial-products/reference/risk-levels/');
            const data = await response.json();
            setRiskLevels(data);
        } catch (error) {
            console.error('Error loading risk levels:', error);
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
            style={{ width: '60vw' }}
            header={assessment?.id ? 'Edit Risk Assessment' : 'New Risk Assessment'}
            modal
            footer={footer}
            onHide={onHide}
        >
            <div className="p-fluid">
                {/* 5C Analysis Sections */}
                <div className="mb-4">
                    <h5>The 5 C's of Credit Risk Assessment</h5>
                    <p className="text-gray-600 mb-3">Evaluate each dimension from 0 (worst) to 100 (best)</p>
                </div>

                {/* 1. Character */}
                <div className="mb-4">
                    <div className="field">
                        <label htmlFor="characterScore">1. Character (0-100)</label>
                        <small className="block mb-2 text-gray-600">
                            Borrower's reputation, credit history, and willingness to repay
                        </small>
                        <InputNumber
                            id="characterScore"
                            value={formData.characterScore}
                            onValueChange={(e) => setFormData({ ...formData, characterScore: e.value || 0 })}
                            min={0}
                            max={100}
                            showButtons
                            buttonLayout="horizontal"
                            step={5}
                        />
                        <ProgressBar
                            value={formData.characterScore}
                            showValue={false}
                            className="mt-2"
                            style={{ height: '8px' }}
                        />
                    </div>
                </div>

                {/* 2. Capacity */}
                <div className="mb-4">
                    <div className="field">
                        <label htmlFor="capacityScore">2. Capacity (0-100)</label>
                        <small className="block mb-2 text-gray-600">
                            Borrower's ability to repay based on income and expenses
                        </small>
                        <InputNumber
                            id="capacityScore"
                            value={formData.capacityScore}
                            onValueChange={(e) => setFormData({ ...formData, capacityScore: e.value || 0 })}
                            min={0}
                            max={100}
                            showButtons
                            buttonLayout="horizontal"
                            step={5}
                        />
                        <ProgressBar
                            value={formData.capacityScore}
                            showValue={false}
                            className="mt-2"
                            style={{ height: '8px' }}
                        />
                    </div>
                </div>

                {/* 3. Capital */}
                <div className="mb-4">
                    <div className="field">
                        <label htmlFor="capitalScore">3. Capital (0-100)</label>
                        <small className="block mb-2 text-gray-600">
                            Borrower's financial resources and equity contribution
                        </small>
                        <InputNumber
                            id="capitalScore"
                            value={formData.capitalScore}
                            onValueChange={(e) => setFormData({ ...formData, capitalScore: e.value || 0 })}
                            min={0}
                            max={100}
                            showButtons
                            buttonLayout="horizontal"
                            step={5}
                        />
                        <ProgressBar
                            value={formData.capitalScore}
                            showValue={false}
                            className="mt-2"
                            style={{ height: '8px' }}
                        />
                    </div>
                </div>

                {/* 4. Collateral */}
                <div className="mb-4">
                    <div className="field">
                        <label htmlFor="collateralScore">4. Collateral (0-100)</label>
                        <small className="block mb-2 text-gray-600">
                            Assets pledged as security for the loan
                        </small>
                        <InputNumber
                            id="collateralScore"
                            value={formData.collateralScore}
                            onValueChange={(e) => setFormData({ ...formData, collateralScore: e.value || 0 })}
                            min={0}
                            max={100}
                            showButtons
                            buttonLayout="horizontal"
                            step={5}
                        />
                        <ProgressBar
                            value={formData.collateralScore}
                            showValue={false}
                            className="mt-2"
                            style={{ height: '8px' }}
                        />
                    </div>
                </div>

                {/* 5. Conditions */}
                <div className="mb-4">
                    <div className="field">
                        <label htmlFor="conditionsScore">5. Conditions (0-100)</label>
                        <small className="block mb-2 text-gray-600">
                            Economic conditions and loan purpose viability
                        </small>
                        <InputNumber
                            id="conditionsScore"
                            value={formData.conditionsScore}
                            onValueChange={(e) => setFormData({ ...formData, conditionsScore: e.value || 0 })}
                            min={0}
                            max={100}
                            showButtons
                            buttonLayout="horizontal"
                            step={5}
                        />
                        <ProgressBar
                            value={formData.conditionsScore}
                            showValue={false}
                            className="mt-2"
                            style={{ height: '8px' }}
                        />
                    </div>
                </div>

                {/* Total Risk Score */}
                <div className="mb-4">
                    <div className="p-3 bg-blue-50 border-round">
                        <div className="flex justify-content-between align-items-center mb-2">
                            <span className="text-lg font-semibold">Total Risk Score:</span>
                            <span className="text-2xl font-bold text-blue-700">
                                {formData.totalRiskScore} / 500
                            </span>
                        </div>
                        <ProgressBar
                            value={(formData.totalRiskScore / 500) * 100}
                            showValue={false}
                            style={{ height: '12px' }}
                        />
                        <div className="flex justify-content-between mt-2" style={{ fontSize: '0.8rem' }}>
                            <small className="text-red-600">High Risk (0-200)</small>
                            <small className="text-orange-600">Medium Risk (200-350)</small>
                            <small className="text-green-600">Low Risk (350-500)</small>
                        </div>
                    </div>
                </div>

                {/* Risk Level */}
                <div className="mb-4">
                    <div className="field">
                        <label htmlFor="riskLevelId">Risk Level Classification</label>
                        <Dropdown
                            id="riskLevelId"
                            value={formData.riskLevelId}
                            options={riskLevels}
                            onChange={(e) => setFormData({ ...formData, riskLevelId: e.value })}
                            optionLabel="name"
                            optionValue="id"
                            placeholder="Select Risk Level"
                            filter
                            showClear
                        />
                    </div>
                </div>

                {/* Assessment Notes */}
                <div className="mb-4">
                    <div className="field">
                        <label htmlFor="assessmentNotes">Assessment Notes</label>
                        <InputTextarea
                            id="assessmentNotes"
                            value={formData.assessmentNotes || ''}
                            onChange={(e) => setFormData({ ...formData, assessmentNotes: e.target.value })}
                            rows={4}
                            placeholder="Detailed assessment notes and justification for scores..."
                        />
                    </div>
                </div>
            </div>
        </Dialog>
    );
};
