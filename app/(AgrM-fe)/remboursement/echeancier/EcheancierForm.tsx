'use client';

import React from 'react';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { Calendar } from 'primereact/calendar';
import { Dropdown } from 'primereact/dropdown';
import { EcheancierRemboursement, STATUTS_ECHEANCE } from '../types/RemboursementTypes';

interface EcheancierFormProps {
    echeancier: EcheancierRemboursement;
    handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    handleDropdownChange: (name: string, value: any) => void;
    handleNumberChange: (name: string, value: number | null) => void;
    handleDateChange: (name: string, value: Date | null) => void;
    isViewMode?: boolean;
}

export default function EcheancierForm({
    echeancier,
    handleChange,
    handleDropdownChange,
    handleNumberChange,
    handleDateChange,
    isViewMode = false
}: EcheancierFormProps) {
    return (
        <div className="grid">
            {/* Section Informations Générales */}
            <div className="col-12">
                <div className="surface-100 p-3 border-round mb-4">
                    <h5 className="mb-3">
                        <i className="pi pi-calendar mr-2"></i>
                        Informations de l'Échéance
                    </h5>

                    <div className="formgrid grid">
                        <div className="field col-12 md:col-3">
                            <label htmlFor="applicationNumber" className="font-semibold">
                                N° Dossier Crédit *
                            </label>
                            <InputText
                                id="applicationNumber"
                                value={echeancier.applicationNumber || ''}
                                className="w-full"
                                disabled={true}
                                placeholder="Ex: CRD-20260131-0149"
                            />
                        </div>

                        <div className="field col-12 md:col-3">
                            <label htmlFor="disbursementNumber" className="font-semibold">
                                N° Décaissement
                            </label>
                            <InputText
                                id="disbursementNumber"
                                value={echeancier.disbursementNumber || ''}
                                className="w-full"
                                disabled={true}
                                placeholder="Ex: DEC-20260201-9241"
                            />
                        </div>

                        <div className="field col-12 md:col-3">
                            <label htmlFor="installmentNumber" className="font-semibold">
                                N° Échéance *
                            </label>
                            <InputNumber
                                id="installmentNumber"
                                value={echeancier.installmentNumber || null}
                                onValueChange={(e) => handleNumberChange('installmentNumber', e.value ?? null)}
                                className="w-full"
                                disabled={isViewMode}
                                min={1}
                            />
                        </div>

                        <div className="field col-12 md:col-3">
                            <label htmlFor="dueDate" className="font-semibold">
                                Date d'Échéance *
                            </label>
                            <Calendar
                                id="dueDate"
                                value={echeancier.dueDate ? new Date(echeancier.dueDate) : null}
                                onChange={(e) => handleDateChange('dueDate', e.value as Date)}
                                className="w-full"
                                disabled={isViewMode}
                                dateFormat="dd/mm/yy"
                                showIcon
                            />
                        </div>

                        <div className="field col-12 md:col-3">
                            <label htmlFor="status" className="font-semibold">
                                Statut
                            </label>
                            <Dropdown
                                id="status"
                                value={echeancier.status}
                                options={STATUTS_ECHEANCE}
                                onChange={(e) => handleDropdownChange('status', e.value)}
                                className="w-full"
                                disabled={isViewMode}
                                placeholder="Sélectionner..."
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Section Montants Dus */}
            <div className="col-12">
                <div className="surface-100 p-3 border-round mb-4">
                    <h5 className="mb-3">
                        <i className="pi pi-money-bill mr-2"></i>
                        Montants à Payer
                    </h5>

                    <div className="formgrid grid">
                        <div className="field col-12 md:col-3">
                            <label htmlFor="principalDue" className="font-semibold">
                                Capital à Rembourser (FBU)
                            </label>
                            <InputNumber
                                id="principalDue"
                                value={echeancier.principalDue || null}
                                onValueChange={(e) => handleNumberChange('principalDue', e.value ?? null)}
                                className="w-full"
                                disabled={isViewMode}
                                mode="currency"
                                currency="BIF"
                                locale="fr-BI"
                            />
                        </div>

                        <div className="field col-12 md:col-3">
                            <label htmlFor="interestDue" className="font-semibold">
                                Intérêts Calculés (FBU)
                            </label>
                            <InputNumber
                                id="interestDue"
                                value={echeancier.interestDue || null}
                                onValueChange={(e) => handleNumberChange('interestDue', e.value ?? null)}
                                className="w-full"
                                disabled={isViewMode}
                                mode="currency"
                                currency="BIF"
                                locale="fr-BI"
                            />
                        </div>

                        <div className="field col-12 md:col-3">
                            <label htmlFor="insuranceDue" className="font-semibold">
                                Assurance (FBU)
                            </label>
                            <InputNumber
                                id="insuranceDue"
                                value={echeancier.insuranceDue || null}
                                onValueChange={(e) => handleNumberChange('insuranceDue', e.value ?? null)}
                                className="w-full"
                                disabled={isViewMode}
                                mode="currency"
                                currency="BIF"
                                locale="fr-BI"
                            />
                        </div>

                        <div className="field col-12 md:col-3">
                            <label htmlFor="feesDue" className="font-semibold">
                                Frais (FBU)
                            </label>
                            <InputNumber
                                id="feesDue"
                                value={echeancier.feesDue || null}
                                onValueChange={(e) => handleNumberChange('feesDue', e.value ?? null)}
                                className="w-full"
                                disabled={isViewMode}
                                mode="currency"
                                currency="BIF"
                                locale="fr-BI"
                            />
                        </div>

                        <div className="field col-12 md:col-3">
                            <label htmlFor="totalDue" className="font-semibold text-primary">
                                Total à Payer (FBU)
                            </label>
                            <InputNumber
                                id="totalDue"
                                value={(echeancier.totalDue || 0) + (echeancier.penaltyAccrued || 0)}
                                className="w-full font-bold"
                                disabled={true}
                                mode="currency"
                                currency="BIF"
                                locale="fr-BI"
                            />
                            {(echeancier.penaltyAccrued || 0) > 0 && (
                                <small className="text-orange-500">
                                    Dont {(echeancier.penaltyAccrued || 0).toLocaleString()} FBU de pénalités
                                </small>
                            )}
                        </div>

                        <div className="field col-12 md:col-3">
                            <label htmlFor="penaltyAccrued" className="font-semibold text-orange-500">
                                Pénalités Accumulées (FBU)
                            </label>
                            <InputNumber
                                id="penaltyAccrued"
                                value={echeancier.penaltyAccrued || null}
                                onValueChange={(e) => handleNumberChange('penaltyAccrued', e.value ?? null)}
                                className="w-full"
                                disabled={isViewMode}
                                mode="currency"
                                currency="BIF"
                                locale="fr-BI"
                            />
                        </div>

                        <div className="field col-12 md:col-3">
                            <label htmlFor="daysOverdue" className="font-semibold text-red-500">
                                Jours de Retard
                            </label>
                            <InputNumber
                                id="daysOverdue"
                                value={echeancier.daysOverdue || null}
                                onValueChange={(e) => handleNumberChange('daysOverdue', e.value ?? null)}
                                className="w-full"
                                disabled={isViewMode}
                                suffix=" jours"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Section Montants Payés */}
            <div className="col-12">
                <div className="surface-100 p-3 border-round mb-4">
                    <h5 className="mb-3">
                        <i className="pi pi-check-circle mr-2"></i>
                        Montants Payés
                    </h5>

                    <div className="formgrid grid">
                        <div className="field col-12 md:col-3">
                            <label htmlFor="principalPaid" className="font-semibold">
                                Capital Payé (FBU)
                            </label>
                            <InputNumber
                                id="principalPaid"
                                value={echeancier.principalPaid || null}
                                onValueChange={(e) => handleNumberChange('principalPaid', e.value ?? null)}
                                className="w-full"
                                disabled={isViewMode}
                                mode="currency"
                                currency="BIF"
                                locale="fr-BI"
                            />
                        </div>

                        <div className="field col-12 md:col-3">
                            <label htmlFor="interestPaid" className="font-semibold">
                                Intérêts Payés (FBU)
                            </label>
                            <InputNumber
                                id="interestPaid"
                                value={echeancier.interestPaid || null}
                                onValueChange={(e) => handleNumberChange('interestPaid', e.value ?? null)}
                                className="w-full"
                                disabled={isViewMode}
                                mode="currency"
                                currency="BIF"
                                locale="fr-BI"
                            />
                        </div>

                        <div className="field col-12 md:col-3">
                            <label htmlFor="insurancePaid" className="font-semibold">
                                Assurance Payée (FBU)
                            </label>
                            <InputNumber
                                id="insurancePaid"
                                value={echeancier.insurancePaid || null}
                                onValueChange={(e) => handleNumberChange('insurancePaid', e.value ?? null)}
                                className="w-full"
                                disabled={isViewMode}
                                mode="currency"
                                currency="BIF"
                                locale="fr-BI"
                            />
                        </div>

                        <div className="field col-12 md:col-3">
                            <label htmlFor="feesPaid" className="font-semibold">
                                Frais Payés (FBU)
                            </label>
                            <InputNumber
                                id="feesPaid"
                                value={echeancier.feesPaid || null}
                                onValueChange={(e) => handleNumberChange('feesPaid', e.value ?? null)}
                                className="w-full"
                                disabled={isViewMode}
                                mode="currency"
                                currency="BIF"
                                locale="fr-BI"
                            />
                        </div>

                        <div className="field col-12 md:col-3">
                            <label htmlFor="totalPaid" className="font-semibold text-green-500">
                                Total Payé (FBU)
                            </label>
                            <InputNumber
                                id="totalPaid"
                                value={echeancier.totalPaid || null}
                                onValueChange={(e) => handleNumberChange('totalPaid', e.value ?? null)}
                                className="w-full font-bold"
                                disabled={isViewMode}
                                mode="currency"
                                currency="BIF"
                                locale="fr-BI"
                            />
                        </div>

                        <div className="field col-12 md:col-3">
                            <label htmlFor="penaltyPaid" className="font-semibold">
                                Pénalités Payées (FBU)
                            </label>
                            <InputNumber
                                id="penaltyPaid"
                                value={echeancier.penaltyPaid || null}
                                onValueChange={(e) => handleNumberChange('penaltyPaid', e.value ?? null)}
                                className="w-full"
                                disabled={isViewMode}
                                mode="currency"
                                currency="BIF"
                                locale="fr-BI"
                            />
                        </div>

                        <div className="field col-12 md:col-3">
                            <label htmlFor="lastPaymentDate" className="font-semibold">
                                Date Dernier Paiement
                            </label>
                            <Calendar
                                id="lastPaymentDate"
                                value={echeancier.lastPaymentDate ? new Date(echeancier.lastPaymentDate) : null}
                                onChange={(e) => handleDateChange('lastPaymentDate', e.value as Date)}
                                className="w-full"
                                disabled={isViewMode}
                                dateFormat="dd/mm/yy"
                                showIcon
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
