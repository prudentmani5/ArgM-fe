'use client';
import React from 'react';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { InputTextarea } from 'primereact/inputtextarea';
import { Checkbox } from 'primereact/checkbox';
import { CreditScoreFactor } from './CreditScoreFactor';

interface CreditScoreFactorFormProps {
    creditScoreFactor: CreditScoreFactor;
    handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    handleNumberChange: (name: string, value: number | null) => void;
    handleCheckboxChange: (name: string, checked: boolean) => void;
}

const CreditScoreFactorForm: React.FC<CreditScoreFactorFormProps> = ({
    creditScoreFactor,
    handleChange,
    handleNumberChange,
    handleCheckboxChange
}) => {
    return (
        <div className="p-fluid">
            <div className="surface-100 p-4 mb-4">
                <h5>Informations de Base</h5>
                <div className="grid">
                    <div className="col-12 md:col-6">
                        <label htmlFor="code">Code *</label>
                        <InputText
                            id="code"
                            name="code"
                            value={creditScoreFactor.code}
                            onChange={handleChange}
                            required
                            maxLength={20}
                        />
                    </div>
                    <div className="col-12 md:col-6">
                        <label htmlFor="maxScore">Max Score *</label>
                        <InputNumber
                            id="maxScore"
                            value={creditScoreFactor.maxScore}
                            onValueChange={(e) => handleNumberChange('maxScore', e.value)}
                            min={0}
                            max={100}
                        />
                    </div>
                    <div className="col-12 md:col-6">
                        <label htmlFor="name">Nom *</label>
                        <InputText
                            id="name"
                            name="name"
                            value={creditScoreFactor.name}
                            onChange={handleChange}
                            required
                            maxLength={100}
                        />
                    </div>
                    <div className="col-12 md:col-6">
                        <label htmlFor="nameFr">Nom (FR) *</label>
                        <InputText
                            id="nameFr"
                            name="nameFr"
                            value={creditScoreFactor.nameFr}
                            onChange={handleChange}
                            required
                            maxLength={100}
                        />
                    </div>
                    <div className="col-12 md:col-6">
                        <label htmlFor="weight">Weight *</label>
                        <InputNumber
                            id="weight"
                            value={creditScoreFactor.weight}
                            onValueChange={(e) => handleNumberChange('weight', e.value)}
                            min={0}
                            max={1}
                            step={0.1}
                            minFractionDigits={1}
                            maxFractionDigits={2}
                        />
                    </div>
                    <div className="col-12 md:col-6">
                        <div className="field-checkbox mt-4">
                            <Checkbox
                                inputId="isActive"
                                checked={creditScoreFactor.isActive}
                                onChange={(e) => handleCheckboxChange('isActive', e.checked || false)}
                            />
                            <label htmlFor="isActive">Actif</label>
                        </div>
                    </div>
                    <div className="col-12 md:col-6">
                        <label htmlFor="description">Description</label>
                        <InputTextarea
                            id="description"
                            name="description"
                            value={creditScoreFactor.description || ''}
                            onChange={handleChange}
                            rows={3}
                        />
                    </div>
                    <div className="col-12 md:col-6">
                        <label htmlFor="descriptionFr">Description (FR)</label>
                        <InputTextarea
                            id="descriptionFr"
                            name="descriptionFr"
                            value={creditScoreFactor.descriptionFr || ''}
                            onChange={handleChange}
                            rows={3}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreditScoreFactorForm;
