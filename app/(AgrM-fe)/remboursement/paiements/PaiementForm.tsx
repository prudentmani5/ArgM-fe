'use client';

import React from 'react';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { Calendar } from 'primereact/calendar';
import { Dropdown } from 'primereact/dropdown';
import { InputTextarea } from 'primereact/inputtextarea';
import { Checkbox } from 'primereact/checkbox';
import { PaiementCredit, ModeRemboursement, MODES_REMBOURSEMENT } from '../types/RemboursementTypes';

interface PaiementFormProps {
    paiement: PaiementCredit;
    handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    handleDropdownChange: (name: string, value: any) => void;
    handleNumberChange: (name: string, value: number | null) => void;
    handleDateChange: (name: string, value: Date | null) => void;
    handleCheckboxChange: (name: string, value: boolean) => void;
    modesRemboursement: ModeRemboursement[];
    isViewMode?: boolean;
}

export default function PaiementForm({
    paiement,
    handleChange,
    handleDropdownChange,
    handleNumberChange,
    handleDateChange,
    handleCheckboxChange,
    modesRemboursement,
    isViewMode = false
}: PaiementFormProps) {
    const getModeRemboursementType = () => {
        if (paiement.isAutoDebit) return 'AUTO_DEBIT';
        if (paiement.isHomeCollection) return 'HOME_COLLECTION';
        if (paiement.isMobileMoney) return 'MOBILE_MONEY';
        if (paiement.isBankTransfer) return 'BANK_TRANSFER';
        return 'AGENCY';
    };

    const handleModeChange = (mode: string) => {
        handleCheckboxChange('isAutoDebit', mode === 'AUTO_DEBIT');
        handleCheckboxChange('isHomeCollection', mode === 'HOME_COLLECTION');
        handleCheckboxChange('isMobileMoney', mode === 'MOBILE_MONEY');
        handleCheckboxChange('isBankTransfer', mode === 'BANK_TRANSFER');
    };

    return (
        <div className="grid">
            {/* Section Informations du Paiement */}
            <div className="col-12">
                <div className="surface-100 p-3 border-round mb-4">
                    <h5 className="mb-3">
                        <i className="pi pi-credit-card mr-2"></i>
                        Informations du Paiement
                    </h5>

                    <div className="formgrid grid">
                        <div className="field col-12 md:col-3">
                            <label htmlFor="paymentNumber" className="font-semibold">
                                N° Paiement
                            </label>
                            <InputText
                                id="paymentNumber"
                                name="paymentNumber"
                                value={paiement.paymentNumber || ''}
                                onChange={handleChange}
                                className="w-full"
                                disabled={true}
                                placeholder="Généré automatiquement"
                            />
                        </div>

                        <div className="field col-12 md:col-3">
                            <label htmlFor="loanId" className="font-semibold">
                                ID Crédit *
                            </label>
                            <InputNumber
                                id="loanId"
                                value={paiement.loanId || null}
                                onValueChange={(e) => handleNumberChange('loanId', e.value ?? null)}
                                className="w-full"
                                disabled={isViewMode}
                                placeholder="ID du crédit"
                            />
                        </div>

                        <div className="field col-12 md:col-3">
                            <label htmlFor="paymentDate" className="font-semibold">
                                Date de Paiement *
                            </label>
                            <Calendar
                                id="paymentDate"
                                value={paiement.paymentDate ? new Date(paiement.paymentDate) : null}
                                onChange={(e) => handleDateChange('paymentDate', e.value as Date)}
                                className="w-full"
                                disabled={isViewMode}
                                dateFormat="dd/mm/yy"
                                showIcon
                            />
                        </div>

                        <div className="field col-12 md:col-3">
                            <label htmlFor="valueDate" className="font-semibold">
                                Date de Valeur
                            </label>
                            <Calendar
                                id="valueDate"
                                value={paiement.valueDate ? new Date(paiement.valueDate) : null}
                                onChange={(e) => handleDateChange('valueDate', e.value as Date)}
                                className="w-full"
                                disabled={isViewMode}
                                dateFormat="dd/mm/yy"
                                showIcon
                            />
                        </div>

                        <div className="field col-12 md:col-4">
                            <label htmlFor="amountReceived" className="font-semibold text-primary">
                                Montant Reçu (FBU) *
                            </label>
                            <InputNumber
                                id="amountReceived"
                                value={paiement.amountReceived || null}
                                onValueChange={(e) => handleNumberChange('amountReceived', e.value ?? null)}
                                className="w-full"
                                disabled={isViewMode}
                                mode="currency"
                                currency="BIF"
                                locale="fr-BI"
                            />
                        </div>

                        <div className="field col-12 md:col-4">
                            <label htmlFor="receiptNumber" className="font-semibold">
                                N° Reçu
                            </label>
                            <InputText
                                id="receiptNumber"
                                name="receiptNumber"
                                value={paiement.receiptNumber || ''}
                                onChange={handleChange}
                                className="w-full"
                                disabled={isViewMode}
                                placeholder="Numéro du reçu"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Section Mode de Remboursement */}
            <div className="col-12">
                <div className="surface-100 p-3 border-round mb-4">
                    <h5 className="mb-3">
                        <i className="pi pi-wallet mr-2"></i>
                        Mode de Remboursement
                    </h5>

                    <div className="formgrid grid">
                        <div className="field col-12 md:col-6">
                            <label htmlFor="modeType" className="font-semibold">
                                Type de Paiement *
                            </label>
                            <Dropdown
                                id="modeType"
                                value={getModeRemboursementType()}
                                options={MODES_REMBOURSEMENT}
                                onChange={(e) => handleModeChange(e.value)}
                                className="w-full"
                                disabled={isViewMode}
                                placeholder="Sélectionner le mode..."
                            />
                        </div>

                        <div className="field col-12 md:col-6">
                            <label htmlFor="repaymentModeId" className="font-semibold">
                                Mode de Remboursement
                            </label>
                            <Dropdown
                                id="repaymentModeId"
                                value={paiement.repaymentModeId}
                                options={modesRemboursement}
                                optionLabel="nameFr"
                                optionValue="id"
                                onChange={(e) => handleDropdownChange('repaymentModeId', e.value)}
                                className="w-full"
                                disabled={isViewMode}
                                placeholder="Sélectionner..."
                            />
                        </div>
                    </div>

                    {/* Détails Prélèvement Automatique */}
                    {paiement.isAutoDebit && (
                        <div className="formgrid grid mt-3 p-3 border-1 border-round surface-50">
                            <div className="col-12">
                                <h6 className="text-primary mb-2">
                                    <i className="pi pi-sync mr-2"></i>
                                    Prélèvement Automatique
                                </h6>
                            </div>
                            <div className="field col-12 md:col-6">
                                <label htmlFor="sourceSavingsAccountId" className="font-semibold">
                                    Compte Épargne Source
                                </label>
                                <InputNumber
                                    id="sourceSavingsAccountId"
                                    value={paiement.sourceSavingsAccountId || null}
                                    onValueChange={(e) => handleNumberChange('sourceSavingsAccountId', e.value ?? null)}
                                    className="w-full"
                                    disabled={isViewMode}
                                />
                            </div>
                        </div>
                    )}

                    {/* Détails Collecte à Domicile */}
                    {paiement.isHomeCollection && (
                        <div className="formgrid grid mt-3 p-3 border-1 border-round surface-50">
                            <div className="col-12">
                                <h6 className="text-primary mb-2">
                                    <i className="pi pi-home mr-2"></i>
                                    Collecte à Domicile
                                </h6>
                            </div>
                            <div className="field col-12 md:col-6">
                                <label htmlFor="collectionAgentId" className="font-semibold">
                                    Agent Collecteur
                                </label>
                                <InputNumber
                                    id="collectionAgentId"
                                    value={paiement.collectionAgentId || null}
                                    onValueChange={(e) => handleNumberChange('collectionAgentId', e.value ?? null)}
                                    className="w-full"
                                    disabled={isViewMode}
                                />
                            </div>
                            <div className="field col-12 md:col-6">
                                <label htmlFor="collectionLocation" className="font-semibold">
                                    Lieu de Collecte
                                </label>
                                <InputText
                                    id="collectionLocation"
                                    name="collectionLocation"
                                    value={paiement.collectionLocation || ''}
                                    onChange={handleChange}
                                    className="w-full"
                                    disabled={isViewMode}
                                />
                            </div>
                        </div>
                    )}

                    {/* Détails Mobile Money */}
                    {paiement.isMobileMoney && (
                        <div className="formgrid grid mt-3 p-3 border-1 border-round surface-50">
                            <div className="col-12">
                                <h6 className="text-primary mb-2">
                                    <i className="pi pi-mobile mr-2"></i>
                                    Mobile Money
                                </h6>
                            </div>
                            <div className="field col-12 md:col-6">
                                <label htmlFor="mobileNumber" className="font-semibold">
                                    Numéro Mobile
                                </label>
                                <InputText
                                    id="mobileNumber"
                                    name="mobileNumber"
                                    value={paiement.mobileNumber || ''}
                                    onChange={handleChange}
                                    className="w-full"
                                    disabled={isViewMode}
                                    placeholder="+257 XX XXX XXX"
                                />
                            </div>
                            <div className="field col-12 md:col-6">
                                <label htmlFor="mobileReference" className="font-semibold">
                                    Référence Transaction
                                </label>
                                <InputText
                                    id="mobileReference"
                                    name="mobileReference"
                                    value={paiement.mobileReference || ''}
                                    onChange={handleChange}
                                    className="w-full"
                                    disabled={isViewMode}
                                />
                            </div>
                        </div>
                    )}

                    {/* Détails Virement Bancaire */}
                    {paiement.isBankTransfer && (
                        <div className="formgrid grid mt-3 p-3 border-1 border-round surface-50">
                            <div className="col-12">
                                <h6 className="text-primary mb-2">
                                    <i className="pi pi-building mr-2"></i>
                                    Virement Bancaire
                                </h6>
                            </div>
                            <div className="field col-12 md:col-6">
                                <label htmlFor="transferReference" className="font-semibold">
                                    Référence Virement *
                                </label>
                                <InputText
                                    id="transferReference"
                                    name="transferReference"
                                    value={paiement.transferReference || ''}
                                    onChange={handleChange}
                                    className="w-full"
                                    disabled={isViewMode}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Section Allocation du Paiement */}
            <div className="col-12">
                <div className="surface-100 p-3 border-round mb-4">
                    <h5 className="mb-3">
                        <i className="pi pi-chart-pie mr-2"></i>
                        Allocation du Paiement (Automatique)
                    </h5>
                    <p className="text-sm text-color-secondary mb-3">
                        Répartition automatique selon la règle: Pénalités → Intérêts → Capital → Assurance → Frais
                    </p>

                    <div className="formgrid grid">
                        <div className="field col-12 md:col-2">
                            <label htmlFor="allocatedToPenalty" className="font-semibold text-orange-500">
                                Pénalités
                            </label>
                            <InputNumber
                                id="allocatedToPenalty"
                                value={paiement.allocatedToPenalty || null}
                                className="w-full"
                                disabled={true}
                                mode="currency"
                                currency="BIF"
                                locale="fr-BI"
                            />
                        </div>

                        <div className="field col-12 md:col-2">
                            <label htmlFor="allocatedToInterest" className="font-semibold text-blue-500">
                                Intérêts
                            </label>
                            <InputNumber
                                id="allocatedToInterest"
                                value={paiement.allocatedToInterest || null}
                                className="w-full"
                                disabled={true}
                                mode="currency"
                                currency="BIF"
                                locale="fr-BI"
                            />
                        </div>

                        <div className="field col-12 md:col-2">
                            <label htmlFor="allocatedToPrincipal" className="font-semibold text-green-500">
                                Capital
                            </label>
                            <InputNumber
                                id="allocatedToPrincipal"
                                value={paiement.allocatedToPrincipal || null}
                                className="w-full"
                                disabled={true}
                                mode="currency"
                                currency="BIF"
                                locale="fr-BI"
                            />
                        </div>

                        <div className="field col-12 md:col-2">
                            <label htmlFor="allocatedToInsurance" className="font-semibold text-purple-500">
                                Assurance
                            </label>
                            <InputNumber
                                id="allocatedToInsurance"
                                value={paiement.allocatedToInsurance || null}
                                className="w-full"
                                disabled={true}
                                mode="currency"
                                currency="BIF"
                                locale="fr-BI"
                            />
                        </div>

                        <div className="field col-12 md:col-2">
                            <label htmlFor="allocatedToFees" className="font-semibold text-gray-500">
                                Frais
                            </label>
                            <InputNumber
                                id="allocatedToFees"
                                value={paiement.allocatedToFees || null}
                                className="w-full"
                                disabled={true}
                                mode="currency"
                                currency="BIF"
                                locale="fr-BI"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Section Notes */}
            <div className="col-12">
                <div className="surface-100 p-3 border-round mb-4">
                    <h5 className="mb-3">
                        <i className="pi pi-file-edit mr-2"></i>
                        Notes
                    </h5>

                    <div className="formgrid grid">
                        <div className="field col-12">
                            <InputTextarea
                                id="notes"
                                name="notes"
                                value={paiement.notes || ''}
                                onChange={handleChange}
                                className="w-full"
                                disabled={isViewMode}
                                rows={3}
                                placeholder="Notes ou observations..."
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
