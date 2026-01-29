'use client';

import React, { useState, useEffect } from 'react';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { InputNumber } from 'primereact/inputnumber';
import { InputTextarea } from 'primereact/inputtextarea';
import { Button } from 'primereact/button';
import { LoanRiskScoreDetail } from './LoanRiskScoreDetail';

interface LoanRiskScoreDetailFormProps {
    visible: boolean;
    scoreDetail?: LoanRiskScoreDetail;
    riskAssessmentId: number;
    onHide: () => void;
    onSave: (scoreDetail: LoanRiskScoreDetail) => void;
}

export const LoanRiskScoreDetailForm: React.FC<LoanRiskScoreDetailFormProps> = ({
    visible,
    scoreDetail,
    riskAssessmentId,
    onHide,
    onSave
}) => {
    const [formData, setFormData] = useState<LoanRiskScoreDetail>(new LoanRiskScoreDetail());
    const [scoreFactors, setScoreFactors] = useState<any[]>([]);

    useEffect(() => {
        if (visible) {
            if (scoreDetail) {
                setFormData(scoreDetail);
            } else {
                const newDetail = new LoanRiskScoreDetail();
                newDetail.riskAssessmentId = riskAssessmentId;
                setFormData(newDetail);
            }
            loadScoreFactors();
        }
    }, [visible, scoreDetail, riskAssessmentId]);

    useEffect(() => {
        // Auto-calculate weighted score
        const weighted = formData.scoreValue * formData.weight;
        setFormData(prev => ({ ...prev, weightedScore: weighted }));
    }, [formData.scoreValue, formData.weight]);

    const loadScoreFactors = async () => {
        try {
            const response = await fetch('/api/financial-products/reference/credit-score-factors/');
            const data = await response.json();
            setScoreFactors(data);
        } catch (error) {
            console.error('Error loading score factors:', error);
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
            header={scoreDetail?.id ? 'Edit Score Detail' : 'New Score Detail'}
            modal
            footer={footer}
            onHide={onHide}
        >
            <div className="p-fluid">
                <div className="field">
                    <label htmlFor="scoreFactorId">Score Factor *</label>
                    <Dropdown
                        id="scoreFactorId"
                        value={formData.scoreFactorId}
                        options={scoreFactors}
                        onChange={(e) => setFormData({ ...formData, scoreFactorId: e.value })}
                        optionLabel="name"
                        optionValue="id"
                        placeholder="Select Score Factor"
                        filter
                        required
                    />
                    <small className="block mt-2 text-gray-600">
                        Select the specific risk factor to evaluate
                    </small>
                </div>

                <div className="field">
                    <label htmlFor="scoreValue">Score Value (0-100) *</label>
                    <InputNumber
                        id="scoreValue"
                        value={formData.scoreValue}
                        onValueChange={(e) => setFormData({ ...formData, scoreValue: e.value || 0 })}
                        min={0}
                        max={100}
                        showButtons
                        required
                    />
                    <small className="block mt-2 text-gray-600">
                        Rate this factor from 0 (worst) to 100 (best)
                    </small>
                </div>

                <div className="field">
                    <label htmlFor="weight">Weight (0-1) *</label>
                    <InputNumber
                        id="weight"
                        value={formData.weight}
                        onValueChange={(e) => setFormData({ ...formData, weight: e.value || 0 })}
                        mode="decimal"
                        minFractionDigits={1}
                        maxFractionDigits={2}
                        min={0}
                        max={1}
                        step={0.1}
                        showButtons
                        required
                    />
                    <small className="block mt-2 text-gray-600">
                        Importance weight of this factor (e.g., 0.3 = 30%)
                    </small>
                </div>

                <div className="field">
                    <label>Weighted Score (Calculated)</label>
                    <div className="p-3 bg-blue-50 border-round">
                        <div className="flex justify-content-between align-items-center">
                            <span className="font-semibold">Weighted Score:</span>
                            <span className="text-2xl font-bold text-blue-700">
                                {formData.weightedScore.toFixed(2)}
                            </span>
                        </div>
                        <small className="block mt-2 text-gray-600">
                            Calculation: {formData.scoreValue} × {formData.weight} = {formData.weightedScore.toFixed(2)}
                        </small>
                    </div>
                </div>

                <div className="field">
                    <label htmlFor="notes">Notes</label>
                    <InputTextarea
                        id="notes"
                        value={formData.notes || ''}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        rows={3}
                        placeholder="Additional notes about this score factor..."
                    />
                </div>
            </div>
        </Dialog>
    );
};
