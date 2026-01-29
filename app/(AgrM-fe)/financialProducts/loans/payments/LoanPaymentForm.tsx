import React from 'react';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { Calendar } from 'primereact/calendar';
import { Dropdown } from 'primereact/dropdown';
import { InputTextarea } from 'primereact/inputtextarea';
import { LoanPayment } from './LoanPayment';

interface LoanPaymentFormProps {
    entity: LoanPayment;
    handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    handleNumberChange: (name: string, value: any) => void;
    handleDropdownChange: (name: string, value: any) => void;
    handleCheckboxChange?: (name: string, checked: boolean) => void;
}

const LoanPaymentForm: React.FC<LoanPaymentFormProps> = ({
    entity,
    handleChange,
    handleNumberChange,
    handleDropdownChange
}) => {
    const formatDate = (dateString?: string) => {
        if (!dateString) return null;
        return new Date(dateString);
    };

    const paymentMethodOptions = [
        { label: 'Espèces', value: 'CASH' },
        { label: 'Virement Bancaire', value: 'BANK_TRANSFER' },
        { label: 'Chèque', value: 'CHECK' },
        { label: 'Mobile Money', value: 'MOBILE_MONEY' },
        { label: 'Carte', value: 'CARD' }
    ];

    const statusOptions = [
        { label: 'Terminé', value: 'COMPLETED' },
        { label: 'En Attente', value: 'PENDING' },
        { label: 'Annulé', value: 'REVERSED' },
        { label: 'Échoué', value: 'FAILED' }
    ];

    return (
        <div className="formgrid grid">
            {/* Informations Générales */}
            <div className="field col-12">
                <div className="surface-100 p-3 border-round">
                    <h5 className="mt-0">Informations Générales</h5>
                    <div className="grid">
                        <div className="col-12 md:col-4">
                            <label htmlFor="paymentNumber">Numéro de Paiement *</label>
                            <InputText
                                id="paymentNumber"
                                name="paymentNumber"
                                value={entity.paymentNumber}
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
                            <label htmlFor="paymentAmount">Montant du Paiement *</label>
                            <InputNumber
                                id="paymentAmount"
                                value={entity.paymentAmount}
                                onValueChange={(e) => handleNumberChange('paymentAmount', e.value)}
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

            {/* Allocation du Paiement */}
            <div className="field col-12">
                <div className="surface-100 p-3 border-round">
                    <h5 className="mt-0">Allocation du Paiement</h5>
                    <div className="grid">
                        <div className="col-12 md:col-4">
                            <label htmlFor="principalPaid">Principal Payé</label>
                            <InputNumber
                                id="principalPaid"
                                value={entity.principalPaid}
                                onValueChange={(e) => handleNumberChange('principalPaid', e.value)}
                                mode="decimal"
                                minFractionDigits={2}
                                className="w-full"
                            />
                        </div>
                        <div className="col-12 md:col-4">
                            <label htmlFor="interestPaid">Intérêts Payés</label>
                            <InputNumber
                                id="interestPaid"
                                value={entity.interestPaid}
                                onValueChange={(e) => handleNumberChange('interestPaid', e.value)}
                                mode="decimal"
                                minFractionDigits={2}
                                className="w-full"
                            />
                        </div>
                        <div className="col-12 md:col-4">
                            <label htmlFor="penaltiesPaid">Pénalités Payées</label>
                            <InputNumber
                                id="penaltiesPaid"
                                value={entity.penaltiesPaid}
                                onValueChange={(e) => handleNumberChange('penaltiesPaid', e.value)}
                                mode="decimal"
                                minFractionDigits={2}
                                className="w-full"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Méthode de Paiement */}
            <div className="field col-12">
                <div className="surface-100 p-3 border-round">
                    <h5 className="mt-0">Méthode de Paiement</h5>
                    <div className="grid">
                        <div className="col-12 md:col-4">
                            <label htmlFor="paymentMethod">Méthode *</label>
                            <Dropdown
                                id="paymentMethod"
                                value={entity.paymentMethod}
                                onChange={(e) => handleDropdownChange('paymentMethod', e.value)}
                                options={paymentMethodOptions}
                                placeholder="Sélectionner une méthode"
                                className="w-full"
                            />
                        </div>
                        <div className="col-12 md:col-4">
                            <label htmlFor="paymentDate">Date de Paiement *</label>
                            <Calendar
                                id="paymentDate"
                                value={formatDate(entity.paymentDate)}
                                onChange={(e) => {
                                    if (e.value) {
                                        const date = e.value as Date;
                                        handleDropdownChange('paymentDate', date.toISOString().split('T')[0]);
                                    }
                                }}
                                dateFormat="yy-mm-dd"
                                className="w-full"
                                showIcon
                            />
                        </div>
                        <div className="col-12 md:col-4">
                            <label htmlFor="transactionChannelId">ID Canal Transaction</label>
                            <InputNumber
                                id="transactionChannelId"
                                value={entity.transactionChannelId}
                                onValueChange={(e) => handleNumberChange('transactionChannelId', e.value)}
                                className="w-full"
                            />
                        </div>

                        {entity.paymentMethod === 'MOBILE_MONEY' && (
                            <div className="col-12 md:col-6">
                                <label htmlFor="mobileMoneyOperatorId">ID Opérateur Mobile Money</label>
                                <InputNumber
                                    id="mobileMoneyOperatorId"
                                    value={entity.mobileMoneyOperatorId}
                                    onValueChange={(e) => handleNumberChange('mobileMoneyOperatorId', e.value)}
                                    className="w-full"
                                />
                            </div>
                        )}

                        <div className="col-12 md:col-6">
                            <label htmlFor="transactionReference">Référence Transaction</label>
                            <InputText
                                id="transactionReference"
                                name="transactionReference"
                                value={entity.transactionReference || ''}
                                onChange={handleChange}
                                className="w-full"
                            />
                        </div>
                        <div className="col-12 md:col-6">
                            <label htmlFor="receiptNumber">Numéro de Reçu</label>
                            <InputText
                                id="receiptNumber"
                                name="receiptNumber"
                                value={entity.receiptNumber || ''}
                                onChange={handleChange}
                                className="w-full"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Informations Complémentaires */}
            <div className="field col-12">
                <div className="surface-100 p-3 border-round">
                    <h5 className="mt-0">Informations Complémentaires</h5>
                    <div className="grid">
                        <div className="col-12 md:col-6">
                            <label htmlFor="receivedById">ID Reçu Par *</label>
                            <InputNumber
                                id="receivedById"
                                value={entity.receivedById}
                                onValueChange={(e) => handleNumberChange('receivedById', e.value)}
                                className="w-full"
                                required
                            />
                        </div>
                        <div className="col-12 md:col-6">
                            <label htmlFor="branchId">ID Agence *</label>
                            <InputNumber
                                id="branchId"
                                value={entity.branchId}
                                onValueChange={(e) => handleNumberChange('branchId', e.value)}
                                className="w-full"
                                required
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

            {/* Annulation */}
            {entity.status === 'REVERSED' && (
                <div className="field col-12">
                    <div className="surface-100 p-3 border-round">
                        <h5 className="mt-0">Informations d'Annulation</h5>
                        <div className="grid">
                            <div className="col-12 md:col-4">
                                <label htmlFor="reversedDate">Date d'Annulation</label>
                                <Calendar
                                    id="reversedDate"
                                    value={formatDate(entity.reversedDate)}
                                    onChange={(e) => {
                                        if (e.value) {
                                            const date = e.value as Date;
                                            handleDropdownChange('reversedDate', date.toISOString().split('T')[0]);
                                        }
                                    }}
                                    dateFormat="yy-mm-dd"
                                    className="w-full"
                                    showIcon
                                />
                            </div>
                            <div className="col-12 md:col-4">
                                <label htmlFor="reversedById">ID Annulé Par</label>
                                <InputNumber
                                    id="reversedById"
                                    value={entity.reversedById}
                                    onValueChange={(e) => handleNumberChange('reversedById', e.value)}
                                    className="w-full"
                                />
                            </div>
                            <div className="col-12 md:col-4">
                                <label htmlFor="reversalReason">Raison d'Annulation</label>
                                <InputText
                                    id="reversalReason"
                                    name="reversalReason"
                                    value={entity.reversalReason || ''}
                                    onChange={handleChange}
                                    className="w-full"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LoanPaymentForm;
