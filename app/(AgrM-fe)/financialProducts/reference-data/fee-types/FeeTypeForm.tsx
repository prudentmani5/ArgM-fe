'use client';
import React from 'react';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Checkbox } from 'primereact/checkbox';
import { FeeType } from './FeeType';

interface FeeTypeFormProps {
    feeType: FeeType;
    handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    handleCheckboxChange: (name: string, checked: boolean) => void;
}

const FeeTypeForm: React.FC<FeeTypeFormProps> = ({
    feeType,
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
                            value={feeType.code}
                            onChange={handleChange}
                            required
                            maxLength={20}
                        />
                    </div>
                    <div className="col-12 md:col-6">
                        <label htmlFor="name">Nom *</label>
                        <InputText
                            id="name"
                            name="name"
                            value={feeType.name}
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
                            value={feeType.nameFr}
                            onChange={handleChange}
                            required
                            maxLength={100}
                        />
                    </div>
                    <div className="col-12 md:col-6">
                        <label htmlFor="description">Description</label>
                        <InputTextarea
                            id="description"
                            name="description"
                            value={feeType.description || ''}
                            onChange={handleChange}
                            rows={3}
                        />
                    </div>
                    <div className="col-12 md:col-6">
                        <label htmlFor="descriptionFr">Description (FR)</label>
                        <InputTextarea
                            id="descriptionFr"
                            name="descriptionFr"
                            value={feeType.descriptionFr || ''}
                            onChange={handleChange}
                            rows={3}
                        />
                    </div>
                    <div className="col-12 md:col-6">
                        <div className="field-checkbox mt-4">
                            <Checkbox
                                inputId="isActive"
                                checked={feeType.isActive}
                                onChange={(e) => handleCheckboxChange('isActive', e.checked || false)}
                            />
                            <label htmlFor="isActive">Actif</label>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FeeTypeForm;
