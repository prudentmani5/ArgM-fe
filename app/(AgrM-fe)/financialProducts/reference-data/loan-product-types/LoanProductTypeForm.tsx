'use client';
import React from 'react';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Checkbox } from 'primereact/checkbox';
import { Dropdown } from 'primereact/dropdown';
import { LoanProductType } from './LoanProductType';

interface LoanProductTypeFormProps {
    loanProductType: LoanProductType;
    handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    handleCheckboxChange: (name: string, checked: boolean) => void;
    handleDropdownChange: (name: string, value: any) => void;
    internalAccounts: any[];
}

const LoanProductTypeForm: React.FC<LoanProductTypeFormProps> = ({
    loanProductType,
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
                            value={loanProductType.code}
                            onChange={handleChange}
                            required
                            maxLength={20}
                        />
                    </div>
                    <div className="col-12 md:col-6">
                        <div className="field-checkbox mt-4">
                            <Checkbox
                                inputId="isActive"
                                checked={loanProductType.isActive}
                                onChange={(e) => handleCheckboxChange('isActive', e.checked || false)}
                            />
                            <label htmlFor="isActive">Actif</label>
                        </div>
                    </div>
                    <div className="col-12 md:col-6">
                        <label htmlFor="name">Nom *</label>
                        <InputText
                            id="name"
                            name="name"
                            value={loanProductType.name}
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
                            value={loanProductType.nameFr}
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
                            value={loanProductType.description || ''}
                            onChange={handleChange}
                            rows={3}
                        />
                    </div>
                    <div className="col-12 md:col-6">
                        <label htmlFor="descriptionFr">Description (FR)</label>
                        <InputTextarea
                            id="descriptionFr"
                            name="descriptionFr"
                            value={loanProductType.descriptionFr || ''}
                            onChange={handleChange}
                            rows={3}
                        />
                    </div>
                </div>
            </div>
            <div className="surface-100 p-4 mb-4">
                <h5>Comptes Internes Correspondants</h5>
                <div className="grid">
                    <div className="col-12 md:col-4">
                        <label htmlFor="portfolioAccountId">Compte Portefeuille Crédit</label>
                        <Dropdown
                            id="portfolioAccountId"
                            value={loanProductType.portfolioAccountId || null}
                            options={internalAccounts}
                            onChange={(e) => handleDropdownChange('portfolioAccountId', e.value)}
                            optionLabel="label"
                            optionValue="value"
                            placeholder="Sélectionner un compte"
                            filter
                            showClear
                            filterPlaceholder="Rechercher..."
                        />
                    </div>
                    <div className="col-12 md:col-4">
                        <label htmlFor="interestAccountId">Compte Intérêt</label>
                        <Dropdown
                            id="interestAccountId"
                            value={loanProductType.interestAccountId || null}
                            options={internalAccounts}
                            onChange={(e) => handleDropdownChange('interestAccountId', e.value)}
                            optionLabel="label"
                            optionValue="value"
                            placeholder="Sélectionner un compte"
                            filter
                            showClear
                            filterPlaceholder="Rechercher..."
                        />
                    </div>
                    <div className="col-12 md:col-4">
                        <label htmlFor="penaltyAccountId">Compte Pénalité</label>
                        <Dropdown
                            id="penaltyAccountId"
                            value={loanProductType.penaltyAccountId || null}
                            options={internalAccounts}
                            onChange={(e) => handleDropdownChange('penaltyAccountId', e.value)}
                            optionLabel="label"
                            optionValue="value"
                            placeholder="Sélectionner un compte"
                            filter
                            showClear
                            filterPlaceholder="Rechercher..."
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoanProductTypeForm;
