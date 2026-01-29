'use client';
import React from 'react';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { InputTextarea } from 'primereact/inputtextarea';
import { Checkbox } from 'primereact/checkbox';
import { ApprovalLevel } from './ApprovalLevel';

interface ApprovalLevelFormProps {
    approvalLevel: ApprovalLevel;
    handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    handleNumberChange: (name: string, value: number | null) => void;
    handleCheckboxChange: (name: string, checked: boolean) => void;
}

const ApprovalLevelForm: React.FC<ApprovalLevelFormProps> = ({
    approvalLevel,
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
                            value={approvalLevel.code}
                            onChange={handleChange}
                            required
                            maxLength={20}
                        />
                    </div>
                    <div className="col-12 md:col-6">
                        <label htmlFor="levelNumber">Level Number *</label>
                        <InputNumber
                            id="levelNumber"
                            value={approvalLevel.levelNumber}
                            onValueChange={(e) => handleNumberChange('levelNumber', e.value)}
                            min={1}
                            max={10}
                        />
                    </div>
                    <div className="col-12 md:col-6">
                        <label htmlFor="name">Nom *</label>
                        <InputText
                            id="name"
                            name="name"
                            value={approvalLevel.name}
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
                            value={approvalLevel.nameFr}
                            onChange={handleChange}
                            required
                            maxLength={100}
                        />
                    </div>
                    <div className="col-12 md:col-4">
                        <label htmlFor="minAmount">Min Amount</label>
                        <InputNumber
                            id="minAmount"
                            value={approvalLevel.minAmount}
                            onValueChange={(e) => handleNumberChange('minAmount', e.value)}
                            mode="currency"
                            currency="USD"
                            locale="en-US"
                        />
                    </div>
                    <div className="col-12 md:col-4">
                        <label htmlFor="maxAmount">Max Amount</label>
                        <InputNumber
                            id="maxAmount"
                            value={approvalLevel.maxAmount}
                            onValueChange={(e) => handleNumberChange('maxAmount', e.value)}
                            mode="currency"
                            currency="USD"
                            locale="en-US"
                        />
                    </div>
                    <div className="col-12 md:col-4">
                        <div className="field-checkbox mt-4">
                            <Checkbox
                                inputId="isActive"
                                checked={approvalLevel.isActive}
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
                            value={approvalLevel.description || ''}
                            onChange={handleChange}
                            rows={3}
                        />
                    </div>
                    <div className="col-12 md:col-6">
                        <label htmlFor="descriptionFr">Description (FR)</label>
                        <InputTextarea
                            id="descriptionFr"
                            name="descriptionFr"
                            value={approvalLevel.descriptionFr || ''}
                            onChange={handleChange}
                            rows={3}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ApprovalLevelForm;
