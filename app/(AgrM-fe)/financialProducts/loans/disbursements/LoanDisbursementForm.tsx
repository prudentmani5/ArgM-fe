import React from 'react';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { Calendar } from 'primereact/calendar';
import { Dropdown } from 'primereact/dropdown';
import { InputTextarea } from 'primereact/inputtextarea';
import { Checkbox } from 'primereact/checkbox';
import { LoanDisbursement } from './LoanDisbursement';

interface LoanDisbursementFormProps {
    entity: LoanDisbursement;
    handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    handleNumberChange: (name: string, value: any) => void;
    handleDropdownChange: (name: string, value: any) => void;
    handleCheckboxChange?: (name: string, checked: boolean) => void;
}

const LoanDisbursementForm: React.FC<LoanDisbursementFormProps> = ({
    entity,
    handleChange,
    handleNumberChange,
    handleDropdownChange
}) => {
    const formatDate = (dateString?: string) => {
        if (!dateString) return null;
        return new Date(dateString);
    };

    const disbursementMethodOptions = [
        { label: 'Espèces', value: 'CASH' },
        { label: 'Virement Bancaire', value: 'BANK_TRANSFER' },
        { label: 'Chèque', value: 'CHECK' },
        { label: 'Mobile Money', value: 'MOBILE_MONEY' },
        { label: 'Dépôt Direct', value: 'DIRECT_DEPOSIT' }
    ];

    const statusOptions = [
        { label: 'En Attente', value: 'PENDING' },
        { label: 'Approuvé', value: 'APPROVED' },
        { label: 'Décaissé', value: 'DISBURSED' },
        { label: 'Annulé', value: 'CANCELLED' }
    ];

    return (
        <div className="formgrid grid">
            {/* Informations Générales */}
            <div className="field col-12">
                <div className="surface-100 p-3 border-round">
                    <h5 className="mt-0">Informations Générales</h5>
                    <div className="grid">
                        <div className="col-12 md:col-4">
                            <label htmlFor="disbursementNumber">Numéro de Décaissement *</label>
                            <InputText
                                id="disbursementNumber"
                                name="disbursementNumber"
                                value={entity.disbursementNumber}
                                onChange={handleChange}
                                className="w-full"
                                required
                            />
                        </div>
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

            {/* Montants */}
            <div className="field col-12">
                <div className="surface-100 p-3 border-round">
                    <h5 className="mt-0">Montants</h5>
                    <div className="grid">
                        <div className="col-12 md:col-4">
                            <label htmlFor="disbursedAmount">Montant Décaissé *</label>
                            <InputNumber
                                id="disbursedAmount"
                                value={entity.disbursedAmount}
                                onValueChange={(e) => handleNumberChange('disbursedAmount', e.value)}
                                mode="decimal"
                                minFractionDigits={2}
                                className="w-full"
                                required
                            />
                        </div>
                        <div className="col-12 md:col-4">
                            <label htmlFor="currencyId">ID Devise *</label>
                            <InputNumber
                                id="currencyId"
                                value={entity.currencyId}
                                onValueChange={(e) => handleNumberChange('currencyId', e.value)}
                                className="w-full"
                                required
                            />
                        </div>
                        <div className="col-12 md:col-4">
                            <label htmlFor="exchangeRate">Taux de Change</label>
                            <InputNumber
                                id="exchangeRate"
                                value={entity.exchangeRate}
                                onValueChange={(e) => handleNumberChange('exchangeRate', e.value)}
                                mode="decimal"
                                minFractionDigits={4}
                                className="w-full"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Méthode de Décaissement */}
            <div className="field col-12">
                <div className="surface-100 p-3 border-round">
                    <h5 className="mt-0">Méthode de Décaissement</h5>
                    <div className="grid">
                        <div className="col-12 md:col-6">
                            <label htmlFor="disbursementMethod">Méthode *</label>
                            <Dropdown
                                id="disbursementMethod"
                                value={entity.disbursementMethod}
                                onChange={(e) => handleDropdownChange('disbursementMethod', e.value)}
                                options={disbursementMethodOptions}
                                placeholder="Sélectionner une méthode"
                                className="w-full"
                            />
                        </div>
                        <div className="col-12 md:col-6">
                            <label htmlFor="disbursementDate">Date de Décaissement *</label>
                            <Calendar
                                id="disbursementDate"
                                value={formatDate(entity.disbursementDate)}
                                onChange={(e) => {
                                    if (e.value) {
                                        const date = e.value as Date;
                                        handleDropdownChange('disbursementDate', date.toISOString().split('T')[0]);
                                    }
                                }}
                                dateFormat="yy-mm-dd"
                                className="w-full"
                                showIcon
                            />
                        </div>

                        {entity.disbursementMethod === 'BANK_TRANSFER' && (
                            <div className="col-12 md:col-6">
                                <label htmlFor="bankAccountNumber">Numéro de Compte Bancaire</label>
                                <InputText
                                    id="bankAccountNumber"
                                    name="bankAccountNumber"
                                    value={entity.bankAccountNumber || ''}
                                    onChange={handleChange}
                                    className="w-full"
                                />
                            </div>
                        )}

                        {entity.disbursementMethod === 'CHECK' && (
                            <div className="col-12 md:col-6">
                                <label htmlFor="checkNumber">Numéro de Chèque</label>
                                <InputText
                                    id="checkNumber"
                                    name="checkNumber"
                                    value={entity.checkNumber || ''}
                                    onChange={handleChange}
                                    className="w-full"
                                />
                            </div>
                        )}

                        {entity.disbursementMethod === 'MOBILE_MONEY' && (
                            <>
                                <div className="col-12 md:col-6">
                                    <label htmlFor="mobileMoneyOperatorId">ID Opérateur Mobile Money</label>
                                    <InputNumber
                                        id="mobileMoneyOperatorId"
                                        value={entity.mobileMoneyOperatorId}
                                        onValueChange={(e) => handleNumberChange('mobileMoneyOperatorId', e.value)}
                                        className="w-full"
                                    />
                                </div>
                                <div className="col-12 md:col-6">
                                    <label htmlFor="mobileMoneyNumber">Numéro Mobile Money</label>
                                    <InputText
                                        id="mobileMoneyNumber"
                                        name="mobileMoneyNumber"
                                        value={entity.mobileMoneyNumber || ''}
                                        onChange={handleChange}
                                        className="w-full"
                                    />
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Informations Complémentaires */}
            <div className="field col-12">
                <div className="surface-100 p-3 border-round">
                    <h5 className="mt-0">Informations Complémentaires</h5>
                    <div className="grid">
                        <div className="col-12 md:col-6">
                            <label htmlFor="disbursedById">ID Décaissé Par *</label>
                            <InputNumber
                                id="disbursedById"
                                value={entity.disbursedById}
                                onValueChange={(e) => handleNumberChange('disbursedById', e.value)}
                                className="w-full"
                                required
                            />
                        </div>
                        <div className="col-12 md:col-6">
                            <label htmlFor="receivedBy">Reçu Par (Nom/Signature)</label>
                            <InputText
                                id="receivedBy"
                                name="receivedBy"
                                value={entity.receivedBy || ''}
                                onChange={handleChange}
                                className="w-full"
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

export default LoanDisbursementForm;
