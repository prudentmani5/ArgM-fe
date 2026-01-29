import React from 'react';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { Calendar } from 'primereact/calendar';
import { Dropdown } from 'primereact/dropdown';
import { InputTextarea } from 'primereact/inputtextarea';
import { LoanGuarantee } from './LoanGuarantee';

interface LoanGuaranteeFormProps {
    entity: LoanGuarantee;
    handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    handleNumberChange: (name: string, value: any) => void;
    handleDropdownChange: (name: string, value: any) => void;
    handleCheckboxChange?: (name: string, checked: boolean) => void;
}

const LoanGuaranteeForm: React.FC<LoanGuaranteeFormProps> = ({
    entity,
    handleChange,
    handleNumberChange,
    handleDropdownChange
}) => {
    const formatDate = (dateString?: string) => {
        if (!dateString) return null;
        return new Date(dateString);
    };

    const statusOptions = [
        { label: 'En Attente', value: 'PENDING' },
        { label: 'Vérifié', value: 'VERIFIED' },
        { label: 'Libéré', value: 'RELEASED' },
        { label: 'Saisi', value: 'SEIZED' }
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
                            <label htmlFor="guaranteeTypeId">ID Type de Garantie *</label>
                            <InputNumber
                                id="guaranteeTypeId"
                                value={entity.guaranteeTypeId}
                                onValueChange={(e) => handleNumberChange('guaranteeTypeId', e.value)}
                                className="w-full"
                                required
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
                        <div className="col-12">
                            <label htmlFor="description">Description *</label>
                            <InputTextarea
                                id="description"
                                name="description"
                                value={entity.description}
                                onChange={handleChange}
                                rows={3}
                                className="w-full"
                                required
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Valeurs */}
            <div className="field col-12">
                <div className="surface-100 p-3 border-round">
                    <h5 className="mt-0">Valeurs</h5>
                    <div className="grid">
                        <div className="col-12 md:col-6">
                            <label htmlFor="estimatedValue">Valeur Estimée *</label>
                            <InputNumber
                                id="estimatedValue"
                                value={entity.estimatedValue}
                                onValueChange={(e) => handleNumberChange('estimatedValue', e.value)}
                                mode="decimal"
                                minFractionDigits={2}
                                className="w-full"
                                required
                            />
                        </div>
                        <div className="col-12 md:col-6">
                            <label htmlFor="verifiedValue">Valeur Vérifiée</label>
                            <InputNumber
                                id="verifiedValue"
                                value={entity.verifiedValue}
                                onValueChange={(e) => handleNumberChange('verifiedValue', e.value)}
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
                        <div className="col-12 md:col-4">
                            <label htmlFor="collateralLocation">Localisation</label>
                            <InputText
                                id="collateralLocation"
                                name="collateralLocation"
                                value={entity.collateralLocation || ''}
                                onChange={handleChange}
                                className="w-full"
                            />
                        </div>
                        <div className="col-12 md:col-4">
                            <label htmlFor="serialNumber">Numéro de Série</label>
                            <InputText
                                id="serialNumber"
                                name="serialNumber"
                                value={entity.serialNumber || ''}
                                onChange={handleChange}
                                className="w-full"
                            />
                        </div>
                        <div className="col-12 md:col-4">
                            <label htmlFor="registrationNumber">Numéro d'Enregistrement</label>
                            <InputText
                                id="registrationNumber"
                                name="registrationNumber"
                                value={entity.registrationNumber || ''}
                                onChange={handleChange}
                                className="w-full"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Propriété */}
            <div className="field col-12">
                <div className="surface-100 p-3 border-round">
                    <h5 className="mt-0">Propriété</h5>
                    <div className="grid">
                        <div className="col-12 md:col-4">
                            <label htmlFor="ownerName">Nom du Propriétaire *</label>
                            <InputText
                                id="ownerName"
                                name="ownerName"
                                value={entity.ownerName}
                                onChange={handleChange}
                                className="w-full"
                                required
                            />
                        </div>
                        <div className="col-12 md:col-4">
                            <label htmlFor="ownerClientId">ID Client Propriétaire</label>
                            <InputNumber
                                id="ownerClientId"
                                value={entity.ownerClientId}
                                onValueChange={(e) => handleNumberChange('ownerClientId', e.value)}
                                className="w-full"
                            />
                        </div>
                        <div className="col-12 md:col-4">
                            <label htmlFor="relationshipToClient">Relation avec le Client</label>
                            <InputText
                                id="relationshipToClient"
                                name="relationshipToClient"
                                value={entity.relationshipToClient || ''}
                                onChange={handleChange}
                                className="w-full"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Vérification */}
            <div className="field col-12">
                <div className="surface-100 p-3 border-round">
                    <h5 className="mt-0">Vérification</h5>
                    <div className="grid">
                        <div className="col-12 md:col-4">
                            <label htmlFor="verificationDate">Date de Vérification</label>
                            <Calendar
                                id="verificationDate"
                                value={formatDate(entity.verificationDate)}
                                onChange={(e) => {
                                    if (e.value) {
                                        const date = e.value as Date;
                                        handleDropdownChange('verificationDate', date.toISOString().split('T')[0]);
                                    }
                                }}
                                dateFormat="yy-mm-dd"
                                className="w-full"
                                showIcon
                            />
                        </div>
                        <div className="col-12 md:col-4">
                            <label htmlFor="verifiedById">ID Vérifié Par</label>
                            <InputNumber
                                id="verifiedById"
                                value={entity.verifiedById}
                                onValueChange={(e) => handleNumberChange('verifiedById', e.value)}
                                className="w-full"
                            />
                        </div>
                        <div className="col-12 md:col-4">
                            <label htmlFor="verificationNotes">Notes de Vérification</label>
                            <InputText
                                id="verificationNotes"
                                name="verificationNotes"
                                value={entity.verificationNotes || ''}
                                onChange={handleChange}
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
                            <div className="col-12 md:col-6">
                                <label htmlFor="releasedById">ID Libéré Par</label>
                                <InputNumber
                                    id="releasedById"
                                    value={entity.releasedById}
                                    onValueChange={(e) => handleNumberChange('releasedById', e.value)}
                                    className="w-full"
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

export default LoanGuaranteeForm;
