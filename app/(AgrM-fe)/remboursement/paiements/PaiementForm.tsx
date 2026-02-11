'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { Calendar } from 'primereact/calendar';
import { Dropdown } from 'primereact/dropdown';
import { InputTextarea } from 'primereact/inputtextarea';
import { Checkbox } from 'primereact/checkbox';
import { PaiementCredit, ModeRemboursement, MODES_REMBOURSEMENT } from '../types/RemboursementTypes';
import { buildApiUrl } from '@/utils/apiConfig';
import Cookies from 'js-cookie';

interface PaiementFormProps {
    paiement: PaiementCredit;
    handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    handleDropdownChange: (name: string, value: any) => void;
    handleNumberChange: (name: string, value: number | null) => void;
    handleDateChange: (name: string, value: Date | null) => void;
    handleCheckboxChange: (name: string, value: boolean) => void;
    modesRemboursement: ModeRemboursement[];
    selectedLoan?: any;
    isViewMode?: boolean;
    onReceiptValidation?: (isValid: boolean) => void;
    onAmountAutoFill?: (amount: number) => void;
}

export default function PaiementForm({
    paiement,
    handleChange,
    handleDropdownChange,
    handleNumberChange,
    handleDateChange,
    handleCheckboxChange,
    modesRemboursement,
    selectedLoan,
    isViewMode = false,
    onReceiptValidation,
    onAmountAutoFill
}: PaiementFormProps) {
    const [receiptError, setReceiptError] = useState<string>('');
    const [receiptValid, setReceiptValid] = useState(false);
    const [receiptDetails, setReceiptDetails] = useState<string>('');
    const [checkingReceipt, setCheckingReceipt] = useState(false);

    const BASE_URL = buildApiUrl('/api/remboursement/payments');

    // Check if payment mode is "Paiement en agence" (AGENCY)
    const isAgencyMode = !paiement.isAutoDebit && !paiement.isHomeCollection && !paiement.isMobileMoney && !paiement.isBankTransfer;

    // Debounced check for receipt number (only for Paiement en agence)
    useEffect(() => {
        const checkReceiptNumber = async () => {
            const receiptNumber = paiement.receiptNumber?.trim();

            // Reset states
            setReceiptError('');
            setReceiptValid(false);
            setReceiptDetails('');

            // Only validate for "Paiement en agence" mode
            if (!isAgencyMode) {
                onReceiptValidation?.(true);
                return;
            }

            if (!receiptNumber || receiptNumber.length < 2) {
                onReceiptValidation?.(true);
                return;
            }

            setCheckingReceipt(true);
            try {
                const token = Cookies.get('token');
                const response = await fetch(`${BASE_URL}/check-receipt/${encodeURIComponent(receiptNumber)}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                    },
                    credentials: 'include'
                });

                if (response.ok) {
                    const data = await response.json();

                    if (data.valid) {
                        // Receipt is valid - auto-fill amount
                        setReceiptValid(true);
                        setReceiptDetails(data.details || '');
                        onReceiptValidation?.(true);

                        // Auto-fill the amount from deposit slip
                        if (data.amount && onAmountAutoFill) {
                            onAmountAutoFill(data.amount);
                        }
                    } else {
                        // Receipt is invalid - show error
                        setReceiptError(data.error || 'Erreur de validation');
                        onReceiptValidation?.(false);
                    }
                }
            } catch (error) {
                console.error('Error checking receipt number:', error);
            } finally {
                setCheckingReceipt(false);
            }
        };

        const timeoutId = setTimeout(checkReceiptNumber, 500);
        return () => clearTimeout(timeoutId);
    }, [paiement.receiptNumber, isAgencyMode]);

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
                                {isAgencyMode ? 'N° Bordereau de Dépôt' : 'N° Reçu'} {isAgencyMode && <span className="text-red-500">*</span>}
                                {checkingReceipt && (
                                    <i className="pi pi-spin pi-spinner ml-2 text-primary" style={{ fontSize: '0.8rem' }}></i>
                                )}
                            </label>
                            <InputText
                                id="receiptNumber"
                                name="receiptNumber"
                                value={paiement.receiptNumber || ''}
                                onChange={handleChange}
                                className={`w-full ${receiptError ? 'p-invalid' : ''} ${receiptValid ? 'border-green-500' : ''}`}
                                disabled={isViewMode}
                                placeholder={isAgencyMode ? "Ex: DS20260205123456" : "Numéro du reçu"}
                            />
                            {receiptError && !isViewMode && isAgencyMode && (
                                <small className="p-error block mt-1">
                                    <i className="pi pi-exclamation-triangle mr-1"></i>
                                    {receiptError}
                                </small>
                            )}
                            {receiptValid && receiptDetails && !isViewMode && isAgencyMode && (
                                <small className="text-green-600 block mt-1">
                                    <i className="pi pi-check-circle mr-1"></i>
                                    {receiptDetails}
                                </small>
                            )}
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
