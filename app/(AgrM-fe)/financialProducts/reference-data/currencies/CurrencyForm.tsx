'use client';
import React from 'react';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { Checkbox } from 'primereact/checkbox';
import { Currency } from './Currency';

interface CurrencyFormProps {
    currency: Currency;
    handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    handleNumberChange: (name: string, value: number | null) => void;
    handleCheckboxChange: (name: string, checked: boolean) => void;
}

const CurrencyForm: React.FC<CurrencyFormProps> = ({
    currency,
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
                            value={currency.code}
                            onChange={handleChange}
                            required
                            maxLength={3}
                            placeholder="ISO 4217 (e.g., USD)"
                        />
                    </div>
                    <div className="col-12 md:col-6">
                        <label htmlFor="symbol">Symbole</label>
                        <InputText
                            id="symbol"
                            name="symbol"
                            value={currency.symbol || ''}
                            onChange={handleChange}
                            maxLength={10}
                            placeholder="e.g., $"
                        />
                    </div>
                    <div className="col-12 md:col-6">
                        <label htmlFor="name">Nom *</label>
                        <InputText
                            id="name"
                            name="name"
                            value={currency.name}
                            onChange={handleChange}
                            required
                            maxLength={50}
                            placeholder="e.g., US Dollar"
                        />
                    </div>
                    <div className="col-12 md:col-6">
                        <label htmlFor="nameFr">Nom (FR) *</label>
                        <InputText
                            id="nameFr"
                            name="nameFr"
                            value={currency.nameFr}
                            onChange={handleChange}
                            required
                            maxLength={50}
                            placeholder="e.g., Dollar américain"
                        />
                    </div>
                    <div className="col-12 md:col-4">
                        <label htmlFor="decimalPlaces">Décimales</label>
                        <InputNumber
                            id="decimalPlaces"
                            value={currency.decimalPlaces}
                            onValueChange={(e) => handleNumberChange('decimalPlaces', e.value)}
                            min={0}
                            max={4}
                        />
                    </div>
                    <div className="col-12 md:col-4">
                        <div className="field-checkbox mt-4">
                            <Checkbox
                                inputId="isDefault"
                                checked={currency.isDefault}
                                onChange={(e) => handleCheckboxChange('isDefault', e.checked || false)}
                            />
                            <label htmlFor="isDefault">Devise par Défaut</label>
                        </div>
                    </div>
                    <div className="col-12 md:col-4">
                        <div className="field-checkbox mt-4">
                            <Checkbox
                                inputId="isActive"
                                checked={currency.isActive}
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

export default CurrencyForm;
