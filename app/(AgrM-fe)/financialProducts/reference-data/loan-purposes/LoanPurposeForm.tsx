'use client';
import React, { useEffect } from 'react';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Checkbox } from 'primereact/checkbox';
import { Dropdown } from 'primereact/dropdown';
import { LoanPurpose } from './LoanPurpose';
import useConsumApi from '@/hooks/fetchData/useConsumApi';
import { buildApiUrl } from '@/utils/apiConfig';

interface LoanPurposeFormProps {
    loanPurpose: LoanPurpose;
    handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    handleDropdownChange: (name: string, value: any) => void;
    handleCheckboxChange: (name: string, checked: boolean) => void;
}

const LoanPurposeForm: React.FC<LoanPurposeFormProps> = ({
    loanPurpose,
    handleChange,
    handleDropdownChange,
    handleCheckboxChange
}) => {
    const { data: activitySectors, loading: loadingActivitySectors, fetchData: fetchActivitySectors } = useConsumApi('');

    useEffect(() => {
        const loadActivitySectors = async () => {
            const url = buildApiUrl('/api/module-customer-group/activity-sectors/findall');
            await fetchActivitySectors(null, 'GET', url, 'getActivitySectors', false);
        };
        loadActivitySectors();
    }, []);

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
                            value={loanPurpose.code}
                            onChange={handleChange}
                            required
                            maxLength={20}
                        />
                    </div>
                    <div className="col-12 md:col-6">
                        <label htmlFor="activitySectorId">Activity Sector *</label>
                        <Dropdown
                            id="activitySectorId"
                            value={loanPurpose.activitySectorId}
                            options={activitySectors || []}
                            optionLabel="name"
                            optionValue="id"
                            onChange={(e) => handleDropdownChange('activitySectorId', e.value)}
                            placeholder="Select Activity Sector"
                            filter
                            disabled={loadingActivitySectors}
                        />
                    </div>
                    <div className="col-12 md:col-6">
                        <label htmlFor="name">Nom *</label>
                        <InputText
                            id="name"
                            name="name"
                            value={loanPurpose.name}
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
                            value={loanPurpose.nameFr}
                            onChange={handleChange}
                            required
                            maxLength={100}
                        />
                    </div>
                    <div className="col-12 md:col-4">
                        <div className="field-checkbox mt-4">
                            <Checkbox
                                inputId="isActive"
                                checked={loanPurpose.isActive}
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
                            value={loanPurpose.description || ''}
                            onChange={handleChange}
                            rows={3}
                        />
                    </div>
                    <div className="col-12 md:col-6">
                        <label htmlFor="descriptionFr">Description (FR)</label>
                        <InputTextarea
                            id="descriptionFr"
                            name="descriptionFr"
                            value={loanPurpose.descriptionFr || ''}
                            onChange={handleChange}
                            rows={3}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoanPurposeForm;
