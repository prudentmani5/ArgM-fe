'use client';
import React from 'react';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Checkbox } from 'primereact/checkbox';
import { TransferPartner } from './TransferPartner';

interface TransferPartnerFormProps {
    transferPartner: TransferPartner;
    handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    handleCheckboxChange: (name: string, checked: boolean) => void;
}

const TransferPartnerForm: React.FC<TransferPartnerFormProps> = ({
    transferPartner,
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
                            value={transferPartner.code}
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
                            value={transferPartner.name}
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
                            value={transferPartner.nameFr}
                            onChange={handleChange}
                            required
                            maxLength={100}
                        />
                    </div>
                    <div className="col-12 md:col-6">
                        <div className="field-checkbox mt-4">
                            <Checkbox
                                inputId="isActive"
                                checked={transferPartner.isActive}
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
                            value={transferPartner.description || ''}
                            onChange={handleChange}
                            rows={3}
                        />
                    </div>
                    <div className="col-12 md:col-6">
                        <label htmlFor="descriptionFr">Description (FR)</label>
                        <InputTextarea
                            id="descriptionFr"
                            name="descriptionFr"
                            value={transferPartner.descriptionFr || ''}
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
                        <label htmlFor="contactPerson">Contact Person</label>
                        <InputText
                            id="contactPerson"
                            name="contactPerson"
                            value={transferPartner.contactPerson || ''}
                            onChange={handleChange}
                            maxLength={100}
                        />
                    </div>
                    <div className="col-12 md:col-6">
                        <label htmlFor="contactPhone">Contact Phone</label>
                        <InputText
                            id="contactPhone"
                            name="contactPhone"
                            value={transferPartner.contactPhone || ''}
                            onChange={handleChange}
                            maxLength={20}
                        />
                    </div>
                    <div className="col-12 md:col-6">
                        <label htmlFor="contactEmail">Contact Email</label>
                        <InputText
                            id="contactEmail"
                            name="contactEmail"
                            value={transferPartner.contactEmail || ''}
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

export default TransferPartnerForm;
