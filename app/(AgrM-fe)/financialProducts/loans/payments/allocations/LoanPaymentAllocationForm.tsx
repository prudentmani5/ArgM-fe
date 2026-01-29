import React from 'react';
import { InputNumber } from 'primereact/inputnumber';
import { LoanPaymentAllocation } from './LoanPaymentAllocation';

interface LoanPaymentAllocationFormProps {
    entity: LoanPaymentAllocation;
}

const LoanPaymentAllocationForm: React.FC<LoanPaymentAllocationFormProps> = ({ entity }) => {
    return (
        <div className="formgrid grid">
            {/* Informations Générales */}
            <div className="field col-12">
                <div className="surface-100 p-3 border-round">
                    <h5 className="mt-0">Informations Générales</h5>
                    <div className="grid">
                        <div className="col-12 md:col-6">
                            <label htmlFor="paymentId">ID Paiement</label>
                            <InputNumber
                                id="paymentId"
                                value={entity.paymentId}
                                className="w-full"
                                readOnly
                            />
                        </div>
                        <div className="col-12 md:col-6">
                            <label htmlFor="scheduleId">ID Échéance</label>
                            <InputNumber
                                id="scheduleId"
                                value={entity.scheduleId}
                                className="w-full"
                                readOnly
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Montants Alloués */}
            <div className="field col-12">
                <div className="surface-100 p-3 border-round">
                    <h5 className="mt-0">Montants Alloués</h5>
                    <div className="grid">
                        <div className="col-12 md:col-3">
                            <label htmlFor="principalAmount">Montant Principal</label>
                            <InputNumber
                                id="principalAmount"
                                value={entity.principalAmount}
                                mode="decimal"
                                minFractionDigits={2}
                                className="w-full"
                                readOnly
                            />
                        </div>
                        <div className="col-12 md:col-3">
                            <label htmlFor="interestAmount">Montant Intérêts</label>
                            <InputNumber
                                id="interestAmount"
                                value={entity.interestAmount}
                                mode="decimal"
                                minFractionDigits={2}
                                className="w-full"
                                readOnly
                            />
                        </div>
                        <div className="col-12 md:col-3">
                            <label htmlFor="penaltyAmount">Montant Pénalités</label>
                            <InputNumber
                                id="penaltyAmount"
                                value={entity.penaltyAmount}
                                mode="decimal"
                                minFractionDigits={2}
                                className="w-full"
                                readOnly
                            />
                        </div>
                        <div className="col-12 md:col-3">
                            <label htmlFor="totalAmount">Montant Total</label>
                            <InputNumber
                                id="totalAmount"
                                value={entity.totalAmount}
                                mode="decimal"
                                minFractionDigits={2}
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

export default LoanPaymentAllocationForm;
