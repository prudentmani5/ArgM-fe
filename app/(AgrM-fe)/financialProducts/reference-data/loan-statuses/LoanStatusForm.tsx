'use client';
import React from 'react';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Checkbox } from 'primereact/checkbox';
import { Dropdown } from 'primereact/dropdown';
import { LoanStatus } from './LoanStatus';

interface LoanStatusFormProps {
    loanStatus: LoanStatus;
    handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    handleDropdownChange: (name: string, value: any) => void;
    handleCheckboxChange: (name: string, checked: boolean) => void;
}

const statusGroupOptions = [
    { label: 'Application', value: 'APPLICATION' },
    { label: 'Actif', value: 'ACTIVE' },
    { label: 'Closed', value: 'CLOSED' },
    { label: 'Problem', value: 'PROBLEM' }
];

const LoanStatusForm: React.FC<LoanStatusFormProps> = ({
    loanStatus,
    handleChange,
    handleDropdownChange,
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
                            value={loanStatus.code}
                            onChange={handleChange}
                            required
                            maxLength={20}
                        />
                    </div>
                    <div className="col-12 md:col-6">
                        <label htmlFor="statusGroup">Status Group *</label>
                        <Dropdown
                            id="statusGroup"
                            value={loanStatus.statusGroup}
                            options={statusGroupOptions}
                            onChange={(e) => handleDropdownChange('statusGroup', e.value)}
                            placeholder="Select Status Group"
                        />
                    </div>
                    <div className="col-12 md:col-6">
                        <label htmlFor="name">Nom *</label>
                        <InputText
                            id="name"
                            name="name"
                            value={loanStatus.name}
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
                            value={loanStatus.nameFr}
                            onChange={handleChange}
                            required
                            maxLength={100}
                        />
                    </div>
                    <div className="col-12 md:col-4">
                        <div className="field-checkbox mt-4">
                            <Checkbox
                                inputId="isActive"
                                checked={loanStatus.isActive}
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
                            value={loanStatus.description || ''}
                            onChange={handleChange}
                            rows={3}
                        />
                    </div>
                    <div className="col-12 md:col-6">
                        <label htmlFor="descriptionFr">Description (FR)</label>
                        <InputTextarea
                            id="descriptionFr"
                            name="descriptionFr"
                            value={loanStatus.descriptionFr || ''}
                            onChange={handleChange}
                            rows={3}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoanStatusForm;
