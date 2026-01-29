import React from 'react';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { Calendar } from 'primereact/calendar';
import { Dropdown } from 'primereact/dropdown';
import { InputTextarea } from 'primereact/inputtextarea';
import { Checkbox } from 'primereact/checkbox';
import { LoanWriteOff } from './LoanWriteOff';

interface LoanWriteOffFormProps {
    entity: LoanWriteOff;
    handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    handleNumberChange: (name: string, value: any) => void;
    handleDropdownChange: (name: string, value: any) => void;
    handleCheckboxChange?: (name: string, checked: boolean) => void;
}

const LoanWriteOffForm: React.FC<LoanWriteOffFormProps> = ({
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

    const writeOffCategoryOptions = [
        { label: 'Perte Totale', value: 'TOTAL_LOSS' },
        { label: 'Récupération Partielle', value: 'PARTIAL_RECOVERY' },
        { label: 'Action Légale', value: 'LEGAL_ACTION' }
    ];

    const statusOptions = [
        { label: 'En Attente', value: 'PENDING' },
        { label: 'Approuvé', value: 'APPROVED' },
        { label: 'Rejeté', value: 'REJECTED' },
        { label: 'Terminé', value: 'COMPLETED' },
        { label: 'Récupéré', value: 'RECOVERED' }
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
                            <label htmlFor="writeOffDate">Date de Passage en Perte *</label>
                            <Calendar
                                id="writeOffDate"
                                value={formatDate(entity.writeOffDate)}
                                onChange={(e) => {
                                    if (e.value) {
                                        const date = e.value as Date;
                                        handleDropdownChange('writeOffDate', date.toISOString().split('T')[0]);
                                    }
                                }}
                                dateFormat="yy-mm-dd"
                                className="w-full"
                                showIcon
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
                            <label htmlFor="writeOffReason">Raison du Passage en Perte *</label>
                            <InputTextarea
                                id="writeOffReason"
                                name="writeOffReason"
                                value={entity.writeOffReason}
                                onChange={handleChange}
                                rows={3}
                                className="w-full"
                                required
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Montants Passés en Perte */}
            <div className="field col-12">
                <div className="surface-100 p-3 border-round" style={{ backgroundColor: '#ffebee' }}>
                    <h5 className="mt-0" style={{ color: '#c62828' }}>Montants Passés en Perte</h5>
                    <div className="grid">
                        <div className="col-12 md:col-3">
                            <label htmlFor="principalWrittenOff">Principal Passé en Perte</label>
                            <InputNumber
                                id="principalWrittenOff"
                                value={entity.principalWrittenOff}
                                onValueChange={(e) => handleNumberChange('principalWrittenOff', e.value)}
                                mode="decimal"
                                minFractionDigits={2}
                                className="w-full"
                            />
                        </div>
                        <div className="col-12 md:col-3">
                            <label htmlFor="interestWrittenOff">Intérêts Passés en Perte</label>
                            <InputNumber
                                id="interestWrittenOff"
                                value={entity.interestWrittenOff}
                                onValueChange={(e) => handleNumberChange('interestWrittenOff', e.value)}
                                mode="decimal"
                                minFractionDigits={2}
                                className="w-full"
                            />
                        </div>
                        <div className="col-12 md:col-3">
                            <label htmlFor="penaltiesWrittenOff">Pénalités Passées en Perte</label>
                            <InputNumber
                                id="penaltiesWrittenOff"
                                value={entity.penaltiesWrittenOff}
                                onValueChange={(e) => handleNumberChange('penaltiesWrittenOff', e.value)}
                                mode="decimal"
                                minFractionDigits={2}
                                className="w-full"
                            />
                        </div>
                        <div className="col-12 md:col-3">
                            <label htmlFor="totalWrittenOff">Total Passé en Perte</label>
                            <InputNumber
                                id="totalWrittenOff"
                                value={entity.totalWrittenOff}
                                onValueChange={(e) => handleNumberChange('totalWrittenOff', e.value)}
                                mode="decimal"
                                minFractionDigits={2}
                                className="w-full"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Potentiel de Récupération */}
            <div className="field col-12">
                <div className="surface-100 p-3 border-round">
                    <h5 className="mt-0">Potentiel de Récupération</h5>
                    <div className="grid">
                        <div className="col-12 md:col-4">
                            <label htmlFor="estimatedRecoveryAmount">Montant de Récupération Estimé</label>
                            <InputNumber
                                id="estimatedRecoveryAmount"
                                value={entity.estimatedRecoveryAmount}
                                onValueChange={(e) => handleNumberChange('estimatedRecoveryAmount', e.value)}
                                mode="decimal"
                                minFractionDigits={2}
                                className="w-full"
                            />
                        </div>
                        <div className="col-12 md:col-4">
                            <label htmlFor="collateralValue">Valeur de la Garantie</label>
                            <InputNumber
                                id="collateralValue"
                                value={entity.collateralValue}
                                onValueChange={(e) => handleNumberChange('collateralValue', e.value)}
                                mode="decimal"
                                minFractionDigits={2}
                                className="w-full"
                            />
                        </div>
                        <div className="col-12 md:col-4">
                            <label htmlFor="writeOffCategory">Catégorie *</label>
                            <Dropdown
                                id="writeOffCategory"
                                value={entity.writeOffCategory}
                                onChange={(e) => handleDropdownChange('writeOffCategory', e.value)}
                                options={writeOffCategoryOptions}
                                placeholder="Sélectionner une catégorie"
                                className="w-full"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Action Légale */}
            <div className="field col-12">
                <div className="surface-100 p-3 border-round">
                    <h5 className="mt-0">Action Légale</h5>
                    <div className="grid">
                        <div className="col-12 md:col-3">
                            <div className="field-checkbox">
                                <Checkbox
                                    inputId="legalActionTaken"
                                    checked={entity.legalActionTaken}
                                    onChange={(e) => handleCheckboxChange && handleCheckboxChange('legalActionTaken', e.checked)}
                                />
                                <label htmlFor="legalActionTaken">Action Légale Prise</label>
                            </div>
                        </div>
                        {entity.legalActionTaken && (
                            <>
                                <div className="col-12 md:col-3">
                                    <label htmlFor="legalActionDate">Date de l'Action Légale</label>
                                    <Calendar
                                        id="legalActionDate"
                                        value={formatDate(entity.legalActionDate)}
                                        onChange={(e) => {
                                            if (e.value) {
                                                const date = e.value as Date;
                                                handleDropdownChange('legalActionDate', date.toISOString().split('T')[0]);
                                            }
                                        }}
                                        dateFormat="yy-mm-dd"
                                        className="w-full"
                                        showIcon
                                    />
                                </div>
                                <div className="col-12 md:col-6">
                                    <label htmlFor="legalCaseNumber">Numéro de Dossier Légal</label>
                                    <InputText
                                        id="legalCaseNumber"
                                        name="legalCaseNumber"
                                        value={entity.legalCaseNumber || ''}
                                        onChange={handleChange}
                                        className="w-full"
                                    />
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Suivi de la Récupération */}
            <div className="field col-12">
                <div className="surface-100 p-3 border-round" style={{ backgroundColor: '#e8f5e9' }}>
                    <h5 className="mt-0" style={{ color: '#2e7d32' }}>Suivi de la Récupération</h5>
                    <div className="grid">
                        <div className="col-12 md:col-6">
                            <label htmlFor="amountRecovered">Montant Récupéré</label>
                            <InputNumber
                                id="amountRecovered"
                                value={entity.amountRecovered}
                                onValueChange={(e) => handleNumberChange('amountRecovered', e.value)}
                                mode="decimal"
                                minFractionDigits={2}
                                className="w-full"
                            />
                        </div>
                        <div className="col-12 md:col-6">
                            <label htmlFor="recoveryDate">Date de Récupération</label>
                            <Calendar
                                id="recoveryDate"
                                value={formatDate(entity.recoveryDate)}
                                onChange={(e) => {
                                    if (e.value) {
                                        const date = e.value as Date;
                                        handleDropdownChange('recoveryDate', date.toISOString().split('T')[0]);
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

            {/* Approbation */}
            <div className="field col-12">
                <div className="surface-100 p-3 border-round">
                    <h5 className="mt-0">Approbation</h5>
                    <div className="grid">
                        <div className="col-12 md:col-4">
                            <label htmlFor="requestedById">ID Demandé Par *</label>
                            <InputNumber
                                id="requestedById"
                                value={entity.requestedById}
                                onValueChange={(e) => handleNumberChange('requestedById', e.value)}
                                className="w-full"
                                required
                            />
                        </div>
                        <div className="col-12 md:col-4">
                            <label htmlFor="approvedById">ID Approuvé Par</label>
                            <InputNumber
                                id="approvedById"
                                value={entity.approvedById}
                                onValueChange={(e) => handleNumberChange('approvedById', e.value)}
                                className="w-full"
                            />
                        </div>
                        <div className="col-12 md:col-4">
                            <label htmlFor="approvalDate">Date d'Approbation</label>
                            <Calendar
                                id="approvalDate"
                                value={formatDate(entity.approvalDate)}
                                onChange={(e) => {
                                    if (e.value) {
                                        const date = e.value as Date;
                                        handleDropdownChange('approvalDate', date.toISOString().split('T')[0]);
                                    }
                                }}
                                dateFormat="yy-mm-dd"
                                className="w-full"
                                showIcon
                            />
                        </div>
                        <div className="col-12">
                            <label htmlFor="notes">Notes</label>
                            <InputTextarea
                                id="notes"
                                name="notes"
                                value={entity.notes || ''}
                                onChange={handleChange}
                                rows={3}
                                className="w-full"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoanWriteOffForm;
