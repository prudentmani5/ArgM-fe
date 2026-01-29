import React from 'react';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { Calendar } from 'primereact/calendar';
import { Badge } from 'primereact/badge';
import { Loan } from './Loan';

interface LoanFormProps {
    entity: Loan;
}

const LoanForm: React.FC<LoanFormProps> = ({ entity }) => {
    const formatDate = (dateString?: string) => {
        if (!dateString) return null;
        return new Date(dateString);
    };

    const getStatusSeverity = (status: string) => {
        switch (status) {
            case 'APPROVED':
                return 'info';
            case 'DISBURSED':
                return 'warning';
            case 'ACTIVE':
                return 'success';
            case 'OVERDUE':
                return 'danger';
            case 'RESTRUCTURED':
                return 'warning';
            case 'CLOSED':
                return 'secondary';
            case 'WRITTEN_OFF':
                return 'danger';
            default:
                return 'secondary';
        }
    };

    const getStatusLabel = (status: string) => {
        const statusMap: { [key: string]: string } = {
            'APPROVED': 'APPROUVÉ',
            'DISBURSED': 'DÉCAISSÉ',
            'ACTIVE': 'ACTIF',
            'OVERDUE': 'EN RETARD',
            'RESTRUCTURED': 'RESTRUCTURÉ',
            'CLOSED': 'CLÔTURÉ',
            'WRITTEN_OFF': 'PASSÉ EN PERTE'
        };
        return statusMap[status] || status;
    };

    return (
        <div className="formgrid grid">
            {/* Informations Générales */}
            <div className="field col-12">
                <div className="surface-100 p-3 border-round">
                    <h5 className="mt-0">Informations Générales</h5>
                    <div className="grid">
                        <div className="col-12 md:col-4">
                            <label htmlFor="loanNumber">Numéro du Prêt *</label>
                            <InputText
                                id="loanNumber"
                                value={entity.loanNumber}
                                className="w-full"
                                readOnly
                            />
                        </div>
                        <div className="col-12 md:col-4">
                            <label htmlFor="status">Statut</label>
                            <div className="mt-2">
                                <Badge
                                    value={getStatusLabel(entity.status)}
                                    severity={getStatusSeverity(entity.status) as any}
                                />
                            </div>
                        </div>
                        <div className="col-12 md:col-4">
                            <label htmlFor="applicationId">ID Demande</label>
                            <InputNumber
                                id="applicationId"
                                value={entity.applicationId}
                                className="w-full"
                                readOnly
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
                            <label htmlFor="approvedAmount">Montant Approuvé *</label>
                            <InputNumber
                                id="approvedAmount"
                                value={entity.approvedAmount}
                                mode="decimal"
                                minFractionDigits={2}
                                className="w-full"
                                readOnly
                            />
                        </div>
                        <div className="col-12 md:col-4">
                            <label htmlFor="disbursedAmount">Montant Décaissé</label>
                            <InputNumber
                                id="disbursedAmount"
                                value={entity.disbursedAmount}
                                mode="decimal"
                                minFractionDigits={2}
                                className="w-full"
                                readOnly
                            />
                        </div>
                        <div className="col-12 md:col-4">
                            <label htmlFor="totalOutstanding">Total Impayé</label>
                            <InputNumber
                                id="totalOutstanding"
                                value={entity.totalOutstanding}
                                mode="decimal"
                                minFractionDigits={2}
                                className="w-full"
                                readOnly
                            />
                        </div>
                        <div className="col-12 md:col-4">
                            <label htmlFor="outstandingPrincipal">Principal Impayé</label>
                            <InputNumber
                                id="outstandingPrincipal"
                                value={entity.outstandingPrincipal}
                                mode="decimal"
                                minFractionDigits={2}
                                className="w-full"
                                readOnly
                            />
                        </div>
                        <div className="col-12 md:col-4">
                            <label htmlFor="outstandingInterest">Intérêts Impayés</label>
                            <InputNumber
                                id="outstandingInterest"
                                value={entity.outstandingInterest}
                                mode="decimal"
                                minFractionDigits={2}
                                className="w-full"
                                readOnly
                            />
                        </div>
                        <div className="col-12 md:col-4">
                            <label htmlFor="outstandingPenalties">Pénalités Impayées</label>
                            <InputNumber
                                id="outstandingPenalties"
                                value={entity.outstandingPenalties}
                                mode="decimal"
                                minFractionDigits={2}
                                className="w-full"
                                readOnly
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Conditions */}
            <div className="field col-12">
                <div className="surface-100 p-3 border-round">
                    <h5 className="mt-0">Conditions du Prêt</h5>
                    <div className="grid">
                        <div className="col-12 md:col-3">
                            <label htmlFor="termMonths">Durée (Mois) *</label>
                            <InputNumber
                                id="termMonths"
                                value={entity.termMonths}
                                className="w-full"
                                readOnly
                            />
                        </div>
                        <div className="col-12 md:col-3">
                            <label htmlFor="numberOfPayments">Nombre de Paiements</label>
                            <InputNumber
                                id="numberOfPayments"
                                value={entity.numberOfPayments}
                                className="w-full"
                                readOnly
                            />
                        </div>
                        <div className="col-12 md:col-3">
                            <label htmlFor="interestRate">Taux d'Intérêt (%)</label>
                            <InputNumber
                                id="interestRate"
                                value={entity.interestRate}
                                mode="decimal"
                                minFractionDigits={2}
                                suffix="%"
                                className="w-full"
                                readOnly
                            />
                        </div>
                        <div className="col-12 md:col-3">
                            <label htmlFor="paymentFrequencyId">ID Fréquence Paiement</label>
                            <InputNumber
                                id="paymentFrequencyId"
                                value={entity.paymentFrequencyId}
                                className="w-full"
                                readOnly
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Dates */}
            <div className="field col-12">
                <div className="surface-100 p-3 border-round">
                    <h5 className="mt-0">Dates Importantes</h5>
                    <div className="grid">
                        <div className="col-12 md:col-3">
                            <label htmlFor="approvalDate">Date d'Approbation *</label>
                            <Calendar
                                id="approvalDate"
                                value={formatDate(entity.approvalDate)}
                                dateFormat="yy-mm-dd"
                                className="w-full"
                                readOnlyInput
                            />
                        </div>
                        <div className="col-12 md:col-3">
                            <label htmlFor="disbursementDate">Date de Décaissement</label>
                            <Calendar
                                id="disbursementDate"
                                value={formatDate(entity.disbursementDate)}
                                dateFormat="yy-mm-dd"
                                className="w-full"
                                readOnlyInput
                            />
                        </div>
                        <div className="col-12 md:col-3">
                            <label htmlFor="firstPaymentDate">Date 1er Paiement</label>
                            <Calendar
                                id="firstPaymentDate"
                                value={formatDate(entity.firstPaymentDate)}
                                dateFormat="yy-mm-dd"
                                className="w-full"
                                readOnlyInput
                            />
                        </div>
                        <div className="col-12 md:col-3">
                            <label htmlFor="maturityDate">Date d'Échéance</label>
                            <Calendar
                                id="maturityDate"
                                value={formatDate(entity.maturityDate)}
                                dateFormat="yy-mm-dd"
                                className="w-full"
                                readOnlyInput
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
                        <div className="col-12 md:col-4">
                            <label htmlFor="productId">ID Produit</label>
                            <InputNumber
                                id="productId"
                                value={entity.productId}
                                className="w-full"
                                readOnly
                            />
                        </div>
                        <div className="col-12 md:col-4">
                            <label htmlFor="branchId">ID Agence</label>
                            <InputNumber
                                id="branchId"
                                value={entity.branchId}
                                className="w-full"
                                readOnly
                            />
                        </div>
                        <div className="col-12 md:col-4">
                            <label htmlFor="loanOfficerId">ID Agent de Crédit</label>
                            <InputNumber
                                id="loanOfficerId"
                                value={entity.loanOfficerId}
                                className="w-full"
                                readOnly
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoanForm;
