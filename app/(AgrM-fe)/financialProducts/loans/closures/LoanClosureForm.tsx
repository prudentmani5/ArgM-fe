import React from 'react';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { Calendar } from 'primereact/calendar';
import { Dropdown } from 'primereact/dropdown';
import { InputTextarea } from 'primereact/inputtextarea';
import { LoanClosure } from './LoanClosure';

interface LoanClosureFormProps {
    entity: LoanClosure;
    handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    handleNumberChange: (name: string, value: any) => void;
    handleDropdownChange: (name: string, value: any) => void;
    handleCheckboxChange?: (name: string, checked: boolean) => void;
}

const LoanClosureForm: React.FC<LoanClosureFormProps> = ({
    entity,
    handleChange,
    handleNumberChange,
    handleDropdownChange
}) => {
    const formatDate = (dateString?: string) => {
        if (!dateString) return null;
        return new Date(dateString);
    };

    const closureTypeOptions = [
        { label: 'Arrivé à Échéance', value: 'MATURED' },
        { label: 'Remboursement Anticipé', value: 'EARLY_REPAYMENT' },
        { label: 'Passé en Perte', value: 'WRITTEN_OFF' },
        { label: 'Restructuré', value: 'RESTRUCTURED' },
        { label: 'Transféré', value: 'TRANSFERRED' }
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
                            <label htmlFor="closureType">Type de Clôture *</label>
                            <Dropdown
                                id="closureType"
                                value={entity.closureType}
                                onChange={(e) => handleDropdownChange('closureType', e.value)}
                                options={closureTypeOptions}
                                placeholder="Sélectionner un type"
                                className="w-full"
                            />
                        </div>
                        <div className="col-12 md:col-4">
                            <label htmlFor="closureDate">Date de Clôture *</label>
                            <Calendar
                                id="closureDate"
                                value={formatDate(entity.closureDate)}
                                onChange={(e) => {
                                    if (e.value) {
                                        const date = e.value as Date;
                                        handleDropdownChange('closureDate', date.toISOString().split('T')[0]);
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

            {/* Montants Finaux Payés */}
            <div className="field col-12">
                <div className="surface-100 p-3 border-round" style={{ backgroundColor: '#e8f5e9' }}>
                    <h5 className="mt-0" style={{ color: '#2e7d32' }}>Montants Finaux Payés</h5>
                    <div className="grid">
                        <div className="col-12 md:col-3">
                            <label htmlFor="finalPrincipalPaid">Principal Payé</label>
                            <InputNumber
                                id="finalPrincipalPaid"
                                value={entity.finalPrincipalPaid}
                                onValueChange={(e) => handleNumberChange('finalPrincipalPaid', e.value)}
                                mode="decimal"
                                minFractionDigits={2}
                                className="w-full"
                            />
                        </div>
                        <div className="col-12 md:col-3">
                            <label htmlFor="finalInterestPaid">Intérêts Payés</label>
                            <InputNumber
                                id="finalInterestPaid"
                                value={entity.finalInterestPaid}
                                onValueChange={(e) => handleNumberChange('finalInterestPaid', e.value)}
                                mode="decimal"
                                minFractionDigits={2}
                                className="w-full"
                            />
                        </div>
                        <div className="col-12 md:col-3">
                            <label htmlFor="finalPenaltiesPaid">Pénalités Payées</label>
                            <InputNumber
                                id="finalPenaltiesPaid"
                                value={entity.finalPenaltiesPaid}
                                onValueChange={(e) => handleNumberChange('finalPenaltiesPaid', e.value)}
                                mode="decimal"
                                minFractionDigits={2}
                                className="w-full"
                            />
                        </div>
                        <div className="col-12 md:col-3">
                            <label htmlFor="totalAmountPaid">Total Payé</label>
                            <InputNumber
                                id="totalAmountPaid"
                                value={entity.totalAmountPaid}
                                onValueChange={(e) => handleNumberChange('totalAmountPaid', e.value)}
                                mode="decimal"
                                minFractionDigits={2}
                                className="w-full"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Montants Impayés à la Clôture */}
            <div className="field col-12">
                <div className="surface-100 p-3 border-round" style={{ backgroundColor: '#ffebee' }}>
                    <h5 className="mt-0" style={{ color: '#c62828' }}>Montants Impayés à la Clôture</h5>
                    <div className="grid">
                        <div className="col-12 md:col-3">
                            <label htmlFor="principalOutstanding">Principal Impayé</label>
                            <InputNumber
                                id="principalOutstanding"
                                value={entity.principalOutstanding}
                                onValueChange={(e) => handleNumberChange('principalOutstanding', e.value)}
                                mode="decimal"
                                minFractionDigits={2}
                                className="w-full"
                            />
                        </div>
                        <div className="col-12 md:col-3">
                            <label htmlFor="interestOutstanding">Intérêts Impayés</label>
                            <InputNumber
                                id="interestOutstanding"
                                value={entity.interestOutstanding}
                                onValueChange={(e) => handleNumberChange('interestOutstanding', e.value)}
                                mode="decimal"
                                minFractionDigits={2}
                                className="w-full"
                            />
                        </div>
                        <div className="col-12 md:col-3">
                            <label htmlFor="penaltiesOutstanding">Pénalités Impayées</label>
                            <InputNumber
                                id="penaltiesOutstanding"
                                value={entity.penaltiesOutstanding}
                                onValueChange={(e) => handleNumberChange('penaltiesOutstanding', e.value)}
                                mode="decimal"
                                minFractionDigits={2}
                                className="w-full"
                            />
                        </div>
                        <div className="col-12 md:col-3">
                            <label htmlFor="totalOutstanding">Total Impayé</label>
                            <InputNumber
                                id="totalOutstanding"
                                value={entity.totalOutstanding}
                                onValueChange={(e) => handleNumberChange('totalOutstanding', e.value)}
                                mode="decimal"
                                minFractionDigits={2}
                                className="w-full"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Exonérations */}
            <div className="field col-12">
                <div className="surface-100 p-3 border-round" style={{ backgroundColor: '#fff3e0' }}>
                    <h5 className="mt-0" style={{ color: '#e65100' }}>Exonérations</h5>
                    <div className="grid">
                        <div className="col-12 md:col-3">
                            <label htmlFor="principalWaived">Principal Exonéré</label>
                            <InputNumber
                                id="principalWaived"
                                value={entity.principalWaived}
                                onValueChange={(e) => handleNumberChange('principalWaived', e.value)}
                                mode="decimal"
                                minFractionDigits={2}
                                className="w-full"
                            />
                        </div>
                        <div className="col-12 md:col-3">
                            <label htmlFor="interestWaived">Intérêts Exonérés</label>
                            <InputNumber
                                id="interestWaived"
                                value={entity.interestWaived}
                                onValueChange={(e) => handleNumberChange('interestWaived', e.value)}
                                mode="decimal"
                                minFractionDigits={2}
                                className="w-full"
                            />
                        </div>
                        <div className="col-12 md:col-3">
                            <label htmlFor="penaltiesWaived">Pénalités Exonérées</label>
                            <InputNumber
                                id="penaltiesWaived"
                                value={entity.penaltiesWaived}
                                onValueChange={(e) => handleNumberChange('penaltiesWaived', e.value)}
                                mode="decimal"
                                minFractionDigits={2}
                                className="w-full"
                            />
                        </div>
                        <div className="col-12 md:col-3">
                            <label htmlFor="waiverReason">Raison d'Exonération</label>
                            <InputText
                                id="waiverReason"
                                name="waiverReason"
                                value={entity.waiverReason || ''}
                                onChange={handleChange}
                                className="w-full"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Remboursement Anticipé */}
            {entity.closureType === 'EARLY_REPAYMENT' && (
                <div className="field col-12">
                    <div className="surface-100 p-3 border-round">
                        <h5 className="mt-0">Remboursement Anticipé</h5>
                        <div className="grid">
                            <div className="col-12 md:col-6">
                                <label htmlFor="earlyRepaymentPenalty">Pénalité de Remboursement Anticipé</label>
                                <InputNumber
                                    id="earlyRepaymentPenalty"
                                    value={entity.earlyRepaymentPenalty}
                                    onValueChange={(e) => handleNumberChange('earlyRepaymentPenalty', e.value)}
                                    mode="decimal"
                                    minFractionDigits={2}
                                    className="w-full"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Passage en Perte */}
            {entity.closureType === 'WRITTEN_OFF' && (
                <div className="field col-12">
                    <div className="surface-100 p-3 border-round">
                        <h5 className="mt-0">Passage en Perte</h5>
                        <div className="grid">
                            <div className="col-12 md:col-6">
                                <label htmlFor="writeOffAmount">Montant Passé en Perte</label>
                                <InputNumber
                                    id="writeOffAmount"
                                    value={entity.writeOffAmount}
                                    onValueChange={(e) => handleNumberChange('writeOffAmount', e.value)}
                                    mode="decimal"
                                    minFractionDigits={2}
                                    className="w-full"
                                />
                            </div>
                            <div className="col-12 md:col-6">
                                <label htmlFor="writeOffReason">Raison du Passage en Perte</label>
                                <InputText
                                    id="writeOffReason"
                                    name="writeOffReason"
                                    value={entity.writeOffReason || ''}
                                    onChange={handleChange}
                                    className="w-full"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Approbation */}
            <div className="field col-12">
                <div className="surface-100 p-3 border-round">
                    <h5 className="mt-0">Approbation</h5>
                    <div className="grid">
                        <div className="col-12 md:col-6">
                            <label htmlFor="closedById">ID Clôturé Par *</label>
                            <InputNumber
                                id="closedById"
                                value={entity.closedById}
                                onValueChange={(e) => handleNumberChange('closedById', e.value)}
                                className="w-full"
                                required
                            />
                        </div>
                        <div className="col-12 md:col-6">
                            <label htmlFor="approvedById">ID Approuvé Par</label>
                            <InputNumber
                                id="approvedById"
                                value={entity.approvedById}
                                onValueChange={(e) => handleNumberChange('approvedById', e.value)}
                                className="w-full"
                            />
                        </div>
                        <div className="col-12">
                            <label htmlFor="closureNotes">Notes de Clôture</label>
                            <InputTextarea
                                id="closureNotes"
                                name="closureNotes"
                                value={entity.closureNotes || ''}
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

export default LoanClosureForm;
