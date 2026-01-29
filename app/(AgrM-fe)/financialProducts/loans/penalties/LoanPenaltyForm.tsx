import React from 'react';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { Calendar } from 'primereact/calendar';
import { Dropdown } from 'primereact/dropdown';
import { LoanPenalty } from './LoanPenalty';

interface LoanPenaltyFormProps {
    entity: LoanPenalty;
    handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    handleNumberChange: (name: string, value: any) => void;
    handleDropdownChange: (name: string, value: any) => void;
    handleCheckboxChange?: (name: string, checked: boolean) => void;
}

const LoanPenaltyForm: React.FC<LoanPenaltyFormProps> = ({
    entity,
    handleChange,
    handleNumberChange,
    handleDropdownChange
}) => {
    const formatDate = (dateString?: string) => {
        if (!dateString) return null;
        return new Date(dateString);
    };

    const penaltyTypeOptions = [
        { label: 'Retard de Paiement', value: 'LATE_PAYMENT' },
        { label: 'Paiement Manqué', value: 'MISSED_PAYMENT' },
        { label: 'Remboursement Anticipé', value: 'EARLY_REPAYMENT' }
    ];

    const calculationMethodOptions = [
        { label: 'Fixe', value: 'FIXED' },
        { label: 'Pourcentage de l\'Échéance', value: 'PERCENTAGE_OF_INSTALLMENT' },
        { label: 'Taux Journalier', value: 'DAILY_RATE' }
    ];

    const statusOptions = [
        { label: 'En Attente', value: 'PENDING' },
        { label: 'Partiellement Payé', value: 'PARTIALLY_PAID' },
        { label: 'Payé', value: 'PAID' },
        { label: 'Exonéré', value: 'WAIVED' }
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
                            <label htmlFor="scheduleId">ID Échéance</label>
                            <InputNumber
                                id="scheduleId"
                                value={entity.scheduleId}
                                onValueChange={(e) => handleNumberChange('scheduleId', e.value)}
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

            {/* Détails de la Pénalité */}
            <div className="field col-12">
                <div className="surface-100 p-3 border-round">
                    <h5 className="mt-0">Détails de la Pénalité</h5>
                    <div className="grid">
                        <div className="col-12 md:col-6">
                            <label htmlFor="penaltyType">Type de Pénalité *</label>
                            <Dropdown
                                id="penaltyType"
                                value={entity.penaltyType}
                                onChange={(e) => handleDropdownChange('penaltyType', e.value)}
                                options={penaltyTypeOptions}
                                placeholder="Sélectionner un type"
                                className="w-full"
                            />
                        </div>
                        <div className="col-12 md:col-6">
                            <label htmlFor="calculationMethod">Méthode de Calcul *</label>
                            <Dropdown
                                id="calculationMethod"
                                value={entity.calculationMethod}
                                onChange={(e) => handleDropdownChange('calculationMethod', e.value)}
                                options={calculationMethodOptions}
                                placeholder="Sélectionner une méthode"
                                className="w-full"
                            />
                        </div>
                        {(entity.calculationMethod === 'PERCENTAGE_OF_INSTALLMENT' || entity.calculationMethod === 'DAILY_RATE') && (
                            <div className="col-12 md:col-4">
                                <label htmlFor="rate">Taux (%)</label>
                                <InputNumber
                                    id="rate"
                                    value={entity.rate}
                                    onValueChange={(e) => handleNumberChange('rate', e.value)}
                                    mode="decimal"
                                    minFractionDigits={2}
                                    suffix="%"
                                    className="w-full"
                                />
                            </div>
                        )}
                        {entity.penaltyType === 'LATE_PAYMENT' && (
                            <div className="col-12 md:col-4">
                                <label htmlFor="daysOverdue">Jours de Retard</label>
                                <InputNumber
                                    id="daysOverdue"
                                    value={entity.daysOverdue}
                                    onValueChange={(e) => handleNumberChange('daysOverdue', e.value)}
                                    className="w-full"
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Montants */}
            <div className="field col-12">
                <div className="surface-100 p-3 border-round">
                    <h5 className="mt-0">Montants</h5>
                    <div className="grid">
                        <div className="col-12 md:col-4">
                            <label htmlFor="penaltyAmount">Montant de la Pénalité *</label>
                            <InputNumber
                                id="penaltyAmount"
                                value={entity.penaltyAmount}
                                onValueChange={(e) => handleNumberChange('penaltyAmount', e.value)}
                                mode="decimal"
                                minFractionDigits={2}
                                className="w-full"
                                required
                            />
                        </div>
                        <div className="col-12 md:col-4">
                            <label htmlFor="amountPaid">Montant Payé</label>
                            <InputNumber
                                id="amountPaid"
                                value={entity.amountPaid}
                                onValueChange={(e) => handleNumberChange('amountPaid', e.value)}
                                mode="decimal"
                                minFractionDigits={2}
                                className="w-full"
                            />
                        </div>
                        <div className="col-12 md:col-4">
                            <label htmlFor="amountOutstanding">Montant Impayé</label>
                            <InputNumber
                                id="amountOutstanding"
                                value={entity.amountOutstanding}
                                onValueChange={(e) => handleNumberChange('amountOutstanding', e.value)}
                                mode="decimal"
                                minFractionDigits={2}
                                className="w-full"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Dates */}
            <div className="field col-12">
                <div className="surface-100 p-3 border-round">
                    <h5 className="mt-0">Dates</h5>
                    <div className="grid">
                        <div className="col-12 md:col-6">
                            <label htmlFor="penaltyDate">Date de Pénalité *</label>
                            <Calendar
                                id="penaltyDate"
                                value={formatDate(entity.penaltyDate)}
                                onChange={(e) => {
                                    if (e.value) {
                                        const date = e.value as Date;
                                        handleDropdownChange('penaltyDate', date.toISOString().split('T')[0]);
                                    }
                                }}
                                dateFormat="yy-mm-dd"
                                className="w-full"
                                showIcon
                            />
                        </div>
                        <div className="col-12 md:col-6">
                            <label htmlFor="dueDate">Date d'Échéance</label>
                            <Calendar
                                id="dueDate"
                                value={formatDate(entity.dueDate)}
                                onChange={(e) => {
                                    if (e.value) {
                                        const date = e.value as Date;
                                        handleDropdownChange('dueDate', date.toISOString().split('T')[0]);
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

            {/* Exonération */}
            {entity.status === 'WAIVED' && (
                <div className="field col-12">
                    <div className="surface-100 p-3 border-round">
                        <h5 className="mt-0">Informations d'Exonération</h5>
                        <div className="grid">
                            <div className="col-12 md:col-4">
                                <label htmlFor="waivedDate">Date d'Exonération</label>
                                <Calendar
                                    id="waivedDate"
                                    value={formatDate(entity.waivedDate)}
                                    onChange={(e) => {
                                        if (e.value) {
                                            const date = e.value as Date;
                                            handleDropdownChange('waivedDate', date.toISOString().split('T')[0]);
                                        }
                                    }}
                                    dateFormat="yy-mm-dd"
                                    className="w-full"
                                    showIcon
                                />
                            </div>
                            <div className="col-12 md:col-4">
                                <label htmlFor="waivedById">ID Exonéré Par</label>
                                <InputNumber
                                    id="waivedById"
                                    value={entity.waivedById}
                                    onValueChange={(e) => handleNumberChange('waivedById', e.value)}
                                    className="w-full"
                                />
                            </div>
                            <div className="col-12 md:col-4">
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

export default LoanPenaltyForm;
