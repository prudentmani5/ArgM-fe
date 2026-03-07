'use client';
import React from 'react';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Checkbox } from 'primereact/checkbox';
import { Dropdown } from 'primereact/dropdown';
import { FeeType } from './FeeType';

interface FeeTypeFormProps {
    feeType: FeeType;
    handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    handleCheckboxChange: (name: string, checked: boolean) => void;
    handleDropdownChange: (name: string, value: any) => void;
    internalAccounts: any[];
}

const FeeTypeForm: React.FC<FeeTypeFormProps> = ({
    feeType,
    handleChange,
    handleCheckboxChange,
    handleDropdownChange,
    internalAccounts
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
                        <label htmlFor="nameFr">Nom *</label>
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
                        <label htmlFor="internalAccountId">Compte Interne Correspondant</label>
                        <Dropdown
                            id="internalAccountId"
                            value={feeType.internalAccountId || null}
                            options={internalAccounts}
                            onChange={(e) => handleDropdownChange('internalAccountId', e.value)}
                            optionLabel="label"
                            optionValue="value"
                            placeholder="Sélectionner un compte interne"
                            filter
                            showClear
                            filterPlaceholder="Rechercher..."
                        />
                    </div>
                    <div className="col-12 md:col-6">
                        <label htmlFor="descriptionFr">Description</label>
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
