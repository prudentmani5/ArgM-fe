import React from 'react';
import { InputNumber } from 'primereact/inputnumber';
import { Calendar } from 'primereact/calendar';
import { Badge } from 'primereact/badge';
import { Checkbox } from 'primereact/checkbox';
import { LoanSchedule } from './LoanSchedule';

interface LoanScheduleFormProps {
    entity: LoanSchedule;
}

const LoanScheduleForm: React.FC<LoanScheduleFormProps> = ({ entity }) => {
    const formatDate = (dateString?: string) => {
        if (!dateString) return null;
        return new Date(dateString);
    };

    const getStatusSeverity = (status: string) => {
        switch (status) {
            case 'PENDING':
                return 'warning';
            case 'PARTIALLY_PAID':
                return 'info';
            case 'FULLY_PAID':
                return 'success';
            case 'OVERDUE':
                return 'danger';
            case 'WRITTEN_OFF':
                return 'secondary';
            default:
                return 'secondary';
        }
    };

    const getStatusLabel = (status: string) => {
        const statusMap: { [key: string]: string } = {
            'PENDING': 'EN ATTENTE',
            'PARTIALLY_PAID': 'PARTIELLEMENT PAYÉ',
            'FULLY_PAID': 'ENTIÈREMENT PAYÉ',
            'OVERDUE': 'EN RETARD',
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
                        <div className="col-12 md:col-3">
                            <label htmlFor="loanId">ID Prêt</label>
                            <InputNumber
                                id="loanId"
                                value={entity.loanId}
                                className="w-full"
                                readOnly
                            />
                        </div>
                        <div className="col-12 md:col-3">
                            <label htmlFor="installmentNumber">Numéro d'Échéance</label>
                            <InputNumber
                                id="installmentNumber"
                                value={entity.installmentNumber}
                                className="w-full"
                                readOnly
                            />
                        </div>
                        <div className="col-12 md:col-3">
                            <label htmlFor="status">Statut</label>
                            <div className="mt-2">
                                <Badge
                                    value={getStatusLabel(entity.status)}
                                    severity={getStatusSeverity(entity.status) as any}
                                />
                            </div>
                        </div>
                        <div className="col-12 md:col-3">
                            <label htmlFor="daysOverdue">Jours de Retard</label>
                            <InputNumber
                                id="daysOverdue"
                                value={entity.daysOverdue || 0}
                                className="w-full"
                                readOnly
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Montants Dus */}
            <div className="field col-12">
                <div className="surface-100 p-3 border-round">
                    <h5 className="mt-0">Montants Dus</h5>
                    <div className="grid">
                        <div className="col-12 md:col-4">
                            <label htmlFor="principalDue">Principal Dû</label>
                            <InputNumber
                                id="principalDue"
                                value={entity.principalDue}
                                mode="decimal"
                                minFractionDigits={2}
                                className="w-full"
                                readOnly
                            />
                        </div>
                        <div className="col-12 md:col-4">
                            <label htmlFor="interestDue">Intérêts Dus</label>
                            <InputNumber
                                id="interestDue"
                                value={entity.interestDue}
                                mode="decimal"
                                minFractionDigits={2}
                                className="w-full"
                                readOnly
                            />
                        </div>
                        <div className="col-12 md:col-4">
                            <label htmlFor="totalDue">Total Dû</label>
                            <InputNumber
                                id="totalDue"
                                value={entity.totalDue}
                                mode="decimal"
                                minFractionDigits={2}
                                className="w-full"
                                readOnly
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Montants Payés */}
            <div className="field col-12">
                <div className="surface-100 p-3 border-round">
                    <h5 className="mt-0">Montants Payés</h5>
                    <div className="grid">
                        <div className="col-12 md:col-3">
                            <label htmlFor="principalPaid">Principal Payé</label>
                            <InputNumber
                                id="principalPaid"
                                value={entity.principalPaid}
                                mode="decimal"
                                minFractionDigits={2}
                                className="w-full"
                                readOnly
                            />
                        </div>
                        <div className="col-12 md:col-3">
                            <label htmlFor="interestPaid">Intérêts Payés</label>
                            <InputNumber
                                id="interestPaid"
                                value={entity.interestPaid}
                                mode="decimal"
                                minFractionDigits={2}
                                className="w-full"
                                readOnly
                            />
                        </div>
                        <div className="col-12 md:col-3">
                            <label htmlFor="penaltiesPaid">Pénalités Payées</label>
                            <InputNumber
                                id="penaltiesPaid"
                                value={entity.penaltiesPaid}
                                mode="decimal"
                                minFractionDigits={2}
                                className="w-full"
                                readOnly
                            />
                        </div>
                        <div className="col-12 md:col-3">
                            <label htmlFor="totalPaid">Total Payé</label>
                            <InputNumber
                                id="totalPaid"
                                value={entity.totalPaid}
                                mode="decimal"
                                minFractionDigits={2}
                                className="w-full"
                                readOnly
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Montants Impayés */}
            <div className="field col-12">
                <div className="surface-100 p-3 border-round">
                    <h5 className="mt-0">Montants Impayés</h5>
                    <div className="grid">
                        <div className="col-12 md:col-6">
                            <label htmlFor="principalOutstanding">Principal Impayé</label>
                            <InputNumber
                                id="principalOutstanding"
                                value={entity.principalOutstanding}
                                mode="decimal"
                                minFractionDigits={2}
                                className="w-full"
                                readOnly
                            />
                        </div>
                        <div className="col-12 md:col-6">
                            <label htmlFor="interestOutstanding">Intérêts Impayés</label>
                            <InputNumber
                                id="interestOutstanding"
                                value={entity.interestOutstanding}
                                mode="decimal"
                                minFractionDigits={2}
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
                    <h5 className="mt-0">Dates</h5>
                    <div className="grid">
                        <div className="col-12 md:col-6">
                            <label htmlFor="dueDate">Date d'Échéance</label>
                            <Calendar
                                id="dueDate"
                                value={formatDate(entity.dueDate)}
                                dateFormat="yy-mm-dd"
                                className="w-full"
                                readOnlyInput
                            />
                        </div>
                        <div className="col-12 md:col-6">
                            <label htmlFor="paidDate">Date de Paiement</label>
                            <Calendar
                                id="paidDate"
                                value={formatDate(entity.paidDate)}
                                dateFormat="yy-mm-dd"
                                className="w-full"
                                readOnlyInput
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Restructuration */}
            <div className="field col-12">
                <div className="surface-100 p-3 border-round">
                    <h5 className="mt-0">Restructuration</h5>
                    <div className="grid">
                        <div className="col-12 md:col-6">
                            <div className="field-checkbox">
                                <Checkbox
                                    inputId="isRestructured"
                                    checked={entity.isRestructured}
                                    disabled
                                />
                                <label htmlFor="isRestructured">Restructuré</label>
                            </div>
                        </div>
                        {entity.isRestructured && (
                            <div className="col-12 md:col-6">
                                <label htmlFor="originalScheduleId">ID Échéance Originale</label>
                                <InputNumber
                                    id="originalScheduleId"
                                    value={entity.originalScheduleId}
                                    className="w-full"
                                    readOnly
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoanScheduleForm;
