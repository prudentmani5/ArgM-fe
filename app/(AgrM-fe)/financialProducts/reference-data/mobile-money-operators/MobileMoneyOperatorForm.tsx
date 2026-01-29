'use client';
import React from 'react';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Checkbox } from 'primereact/checkbox';
import { MobileMoneyOperator } from './MobileMoneyOperator';

interface MobileMoneyOperatorFormProps {
    mobileMoneyOperator: MobileMoneyOperator;
    handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    handleCheckboxChange: (name: string, checked: boolean) => void;
}

const MobileMoneyOperatorForm: React.FC<MobileMoneyOperatorFormProps> = ({
    mobileMoneyOperator,
    handleChange,
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
                            value={mobileMoneyOperator.code}
                            onChange={handleChange}
                            required
                            maxLength={20}
                        />
                    </div>
                    <div className="col-12 md:col-6">
                        <label htmlFor="shortCode">Short Code</label>
                        <InputText
                            id="shortCode"
                            name="shortCode"
                            value={mobileMoneyOperator.shortCode || ''}
                            onChange={handleChange}
                            maxLength={10}
                        />
                    </div>
                    <div className="col-12 md:col-6">
                        <label htmlFor="name">Nom *</label>
                        <InputText
                            id="name"
                            name="name"
                            value={mobileMoneyOperator.name}
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
                            value={mobileMoneyOperator.nameFr}
                            onChange={handleChange}
                            required
                            maxLength={100}
                        />
                    </div>
                    <div className="col-12 md:col-6">
                        <div className="field-checkbox mt-4">
                            <Checkbox
                                inputId="isActive"
                                checked={mobileMoneyOperator.isActive}
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
                            value={mobileMoneyOperator.description || ''}
                            onChange={handleChange}
                            rows={3}
                        />
                    </div>
                    <div className="col-12 md:col-6">
                        <label htmlFor="descriptionFr">Description (FR)</label>
                        <InputTextarea
                            id="descriptionFr"
                            name="descriptionFr"
                            value={mobileMoneyOperator.descriptionFr || ''}
                            onChange={handleChange}
                            rows={3}
                        />
                    </div>
                </div>
            </div>

            <div className="surface-100 p-4 mb-4">
                <h5>Contact Information</h5>
                <div className="grid">
                    <div className="col-12 md:col-6">
                        <label htmlFor="contactPhone">Contact Phone</label>
                        <InputText
                            id="contactPhone"
                            name="contactPhone"
                            value={mobileMoneyOperator.contactPhone || ''}
                            onChange={handleChange}
                            maxLength={20}
                        />
                    </div>
                    <div className="col-12 md:col-6">
                        <label htmlFor="contactEmail">Contact Email</label>
                        <InputText
                            id="contactEmail"
                            name="contactEmail"
                            value={mobileMoneyOperator.contactEmail || ''}
                            onChange={handleChange}
                            maxLength={100}
                            type="email"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MobileMoneyOperatorForm;
