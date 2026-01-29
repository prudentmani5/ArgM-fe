import React from 'react';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { Calendar } from 'primereact/calendar';
import { Dropdown } from 'primereact/dropdown';
import { Checkbox } from 'primereact/checkbox';
import { LoanGuarantor } from './LoanGuarantor';

interface LoanGuarantorFormProps {
    entity: LoanGuarantor;
    handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    handleNumberChange: (name: string, value: any) => void;
    handleDropdownChange: (name: string, value: any) => void;
    handleCheckboxChange?: (name: string, checked: boolean) => void;
}

const LoanGuarantorForm: React.FC<LoanGuarantorFormProps> = ({
    entity,
    handleChange,
    handleNumberChange,
    handleDropdownChange,
    handleCheckboxChange
}) => {
    const formatDate = (dateString?: string) => {
        if (!dateString) return null;
        return new Date(dateString);
    };

    const statusOptions = [
        { label: 'Actif', value: 'ACTIVE' },
        { label: 'Libéré', value: 'RELEASED' },
        { label: 'En Défaut', value: 'DEFAULTED' }
    ];

    return (
        <div className="formgrid grid">
            {/* Informations Générales */}
            <div className="field col-12">
                <div className="surface-100 p-3 border-round">
                    <h5 className="mt-0">Informations Générales</h5>
                    <div className="grid">
                        <div className="col-12 md:col-4">
                            <label htmlFor="loanId">ID Prêt *</label>
                            <InputNumber
                                id="loanId"
                                value={entity.loanId}
                                onValueChange={(e) => handleNumberChange('loanId', e.value)}
                                className="w-full"
                                required
                            />
                        </div>
                        <div className="col-12 md:col-4">
                            <label htmlFor="guaranteeId">ID Garantie</label>
                            <InputNumber
                                id="guaranteeId"
                                value={entity.guaranteeId}
                                onValueChange={(e) => handleNumberChange('guaranteeId', e.value)}
                                className="w-full"
                            />
                        </div>
                        <div className="col-12 md:col-4">
                            <label htmlFor="status">Statut *</label>
                            <Dropdown
                                id="status"
                                value={entity.status}
                                onChange={(e) => handleDropdownChange('status', e.value)}
                                options={statusOptions}
                                placeholder="Sélectionner un statut"
                                className="w-full"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Identité du Garant */}
            <div className="field col-12">
                <div className="surface-100 p-3 border-round">
                    <h5 className="mt-0">Identité du Garant</h5>
                    <div className="grid">
                        <div className="col-12 md:col-3">
                            <label htmlFor="guarantorName">Nom du Garant *</label>
                            <InputText
                                id="guarantorName"
                                name="guarantorName"
                                value={entity.guarantorName}
                                onChange={handleChange}
                                className="w-full"
                                required
                            />
                        </div>
                        <div className="col-12 md:col-3">
                            <label htmlFor="guarantorIdNumber">Numéro d'Identité *</label>
                            <InputText
                                id="guarantorIdNumber"
                                name="guarantorIdNumber"
                                value={entity.guarantorIdNumber}
                                onChange={handleChange}
                                className="w-full"
                                required
                            />
                        </div>
                        <div className="col-12 md:col-3">
                            <label htmlFor="guarantorPhone">Téléphone *</label>
                            <InputText
                                id="guarantorPhone"
                                name="guarantorPhone"
                                value={entity.guarantorPhone}
                                onChange={handleChange}
                                className="w-full"
                                required
                            />
                        </div>
                        <div className="col-12 md:col-3">
                            <label htmlFor="guarantorEmail">Email</label>
                            <InputText
                                id="guarantorEmail"
                                name="guarantorEmail"
                                value={entity.guarantorEmail || ''}
                                onChange={handleChange}
                                className="w-full"
                            />
                        </div>
                        <div className="col-12 md:col-6">
                            <label htmlFor="guarantorAddress">Adresse</label>
                            <InputText
                                id="guarantorAddress"
                                name="guarantorAddress"
                                value={entity.guarantorAddress || ''}
                                onChange={handleChange}
                                className="w-full"
                            />
                        </div>
                        <div className="col-12 md:col-6">
                            <label htmlFor="guarantorClientId">ID Client Garant</label>
                            <InputNumber
                                id="guarantorClientId"
                                value={entity.guarantorClientId}
                                onValueChange={(e) => handleNumberChange('guarantorClientId', e.value)}
                                className="w-full"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Relation et Emploi */}
            <div className="field col-12">
                <div className="surface-100 p-3 border-round">
                    <h5 className="mt-0">Relation et Emploi</h5>
                    <div className="grid">
                        <div className="col-12 md:col-4">
                            <label htmlFor="relationshipToClient">Relation avec le Client *</label>
                            <InputText
                                id="relationshipToClient"
                                name="relationshipToClient"
                                value={entity.relationshipToClient}
                                onChange={handleChange}
                                className="w-full"
                                required
                            />
                        </div>
                        <div className="col-12 md:col-4">
                            <label htmlFor="employerName">Nom de l'Employeur</label>
                            <InputText
                                id="employerName"
                                name="employerName"
                                value={entity.employerName || ''}
                                onChange={handleChange}
                                className="w-full"
                            />
                        </div>
                        <div className="col-12 md:col-4">
                            <label htmlFor="monthlyIncome">Revenu Mensuel</label>
                            <InputNumber
                                id="monthlyIncome"
                                value={entity.monthlyIncome}
                                onValueChange={(e) => handleNumberChange('monthlyIncome', e.value)}
                                mode="decimal"
                                minFractionDigits={2}
                                className="w-full"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Spécificités de la Garantie */}
            <div className="field col-12">
                <div className="surface-100 p-3 border-round">
                    <h5 className="mt-0">Spécificités de la Garantie</h5>
                    <div className="grid">
                        <div className="col-12 md:col-6">
                            <label htmlFor="guaranteedAmount">Montant Garanti *</label>
                            <InputNumber
                                id="guaranteedAmount"
                                value={entity.guaranteedAmount}
                                onValueChange={(e) => handleNumberChange('guaranteedAmount', e.value)}
                                mode="decimal"
                                minFractionDigits={2}
                                className="w-full"
                                required
                            />
                        </div>
                        <div className="col-12 md:col-6">
                            <label htmlFor="guaranteePercentage">Pourcentage de Garantie (%)</label>
                            <InputNumber
                                id="guaranteePercentage"
                                value={entity.guaranteePercentage}
                                onValueChange={(e) => handleNumberChange('guaranteePercentage', e.value)}
                                mode="decimal"
                                minFractionDigits={2}
                                suffix="%"
                                className="w-full"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Documents */}
            <div className="field col-12">
                <div className="surface-100 p-3 border-round">
                    <h5 className="mt-0">Documents</h5>
                    <div className="grid">
                        <div className="col-12 md:col-4">
                            <label htmlFor="documentTypeId">ID Type de Document</label>
                            <InputNumber
                                id="documentTypeId"
                                value={entity.documentTypeId}
                                onValueChange={(e) => handleNumberChange('documentTypeId', e.value)}
                                className="w-full"
                            />
                        </div>
                        <div className="col-12 md:col-4">
                            <label htmlFor="documentNumber">Numéro de Document</label>
                            <InputText
                                id="documentNumber"
                                name="documentNumber"
                                value={entity.documentNumber || ''}
                                onChange={handleChange}
                                className="w-full"
                            />
                        </div>
                        <div className="col-12 md:col-4">
                            <label htmlFor="documentUrl">URL du Document</label>
                            <InputText
                                id="documentUrl"
                                name="documentUrl"
                                value={entity.documentUrl || ''}
                                onChange={handleChange}
                                className="w-full"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Consentement */}
            <div className="field col-12">
                <div className="surface-100 p-3 border-round">
                    <h5 className="mt-0">Consentement</h5>
                    <div className="grid">
                        <div className="col-12 md:col-4">
                            <div className="field-checkbox">
                                <Checkbox
                                    inputId="consentGiven"
                                    checked={entity.consentGiven}
                                    onChange={(e) => handleCheckboxChange && handleCheckboxChange('consentGiven', e.checked)}
                                />
                                <label htmlFor="consentGiven">Consentement Donné</label>
                            </div>
                        </div>
                        {entity.consentGiven && (
                            <>
                                <div className="col-12 md:col-4">
                                    <label htmlFor="consentDate">Date de Consentement</label>
                                    <Calendar
                                        id="consentDate"
                                        value={formatDate(entity.consentDate)}
                                        onChange={(e) => {
                                            if (e.value) {
                                                const date = e.value as Date;
                                                handleDropdownChange('consentDate', date.toISOString().split('T')[0]);
                                            }
                                        }}
                                        dateFormat="yy-mm-dd"
                                        className="w-full"
                                        showIcon
                                    />
                                </div>
                                <div className="col-12 md:col-4">
                                    <label htmlFor="consentDocumentUrl">URL Document de Consentement</label>
                                    <InputText
                                        id="consentDocumentUrl"
                                        name="consentDocumentUrl"
                                        value={entity.consentDocumentUrl || ''}
                                        onChange={handleChange}
                                        className="w-full"
                                    />
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Libération */}
            {entity.status === 'RELEASED' && (
                <div className="field col-12">
                    <div className="surface-100 p-3 border-round">
                        <h5 className="mt-0">Informations de Libération</h5>
                        <div className="grid">
                            <div className="col-12 md:col-6">
                                <label htmlFor="releaseDate">Date de Libération</label>
                                <Calendar
                                    id="releaseDate"
                                    value={formatDate(entity.releaseDate)}
                                    onChange={(e) => {
                                        if (e.value) {
                                            const date = e.value as Date;
                                            handleDropdownChange('releaseDate', date.toISOString().split('T')[0]);
                                        }
                                    }}
                                    dateFormat="yy-mm-dd"
                                    className="w-full"
                                    showIcon
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Informations Complémentaires */}
            <div className="field col-12">
                <div className="surface-100 p-3 border-round">
                    <h5 className="mt-0">Informations Complémentaires</h5>
                    <div className="grid">
                        <div className="col-12 md:col-6">
                            <label htmlFor="createdById">ID Créé Par *</label>
                            <InputNumber
                                id="createdById"
                                value={entity.createdById}
                                onValueChange={(e) => handleNumberChange('createdById', e.value)}
                                className="w-full"
                                required
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoanGuarantorForm;
