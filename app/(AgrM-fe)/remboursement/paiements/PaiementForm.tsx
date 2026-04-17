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
import { parseLocalDate } from '@/utils/dateUtils';
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
    const [savingsAccountInfo, setSavingsAccountInfo] = useState<any>(null);

    // Virement interne: search for a source savings account (different from the client's own account)
    const [virSearchTerm, setVirSearchTerm] = useState('');
    const [virSearchResults, setVirSearchResults] = useState<any[]>([]);
    const [virSearching, setVirSearching] = useState(false);
    const [virSelectedAccount, setVirSelectedAccount] = useState<any>(null);

    const BASE_URL = buildApiUrl('/api/remboursement/payments');
    const SAVINGS_URL = buildApiUrl('/api/savings-accounts');

    // Load savings account info when sourceSavingsAccountId changes
    useEffect(() => {
        const loadSavingsAccount = async () => {
            if (!paiement.sourceSavingsAccountId) {
                setSavingsAccountInfo(null);
                return;
            }
            try {
                const token = Cookies.get('token');
                const response = await fetch(`${SAVINGS_URL}/findbyid/${paiement.sourceSavingsAccountId}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                    },
                    credentials: 'include'
                });
                if (response.ok) {
                    const data = await response.json();
                    setSavingsAccountInfo(data);
                }
            } catch (error) {
                console.error('Error loading savings account:', error);
            }
        };
        loadSavingsAccount();
    }, [paiement.sourceSavingsAccountId]);

    // Check if payment mode is "Paiement en agence" (AGENCY) — needs bordereau validation
    const isAgencyMode = !paiement.isAutoDebit && !paiement.isHomeCollection && !paiement.isMobileMoney && !paiement.isBankTransfer && !paiement.isInternalTransfer;

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

    // Search savings accounts for virement interne
    const searchVirementSavingsAccounts = async (term: string) => {
        if (!term || term.trim().length < 2) {
            setVirSearchResults([]);
            return;
        }
        setVirSearching(true);
        try {
            const token = Cookies.get('token');
            const response = await fetch(`${SAVINGS_URL}/search?searchTerm=${encodeURIComponent(term.trim())}&page=0&size=10`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                },
                credentials: 'include'
            });
            if (response.ok) {
                const data = await response.json();
                setVirSearchResults(Array.isArray(data) ? data : data.content || []);
            }
        } catch (e) {
            setVirSearchResults([]);
        } finally {
            setVirSearching(false);
        }
    };

    const handleVirAccountSelect = (account: any) => {
        setVirSelectedAccount(account);
        setVirSearchTerm('');
        setVirSearchResults([]);
        // Override sourceSavingsAccountId with the selected account
        handleNumberChange('sourceSavingsAccountId', account.id);
    };

    const clearVirAccount = () => {
        setVirSelectedAccount(null);
        setVirSearchTerm('');
        setVirSearchResults([]);
        handleNumberChange('sourceSavingsAccountId', null);
    };

    const getModeRemboursementType = () => {
        if (paiement.isAutoDebit) return 'AUTO_DEBIT';
        if (paiement.isHomeCollection) return 'HOME_COLLECTION';
        if (paiement.isMobileMoney) return 'MOBILE_MONEY';
        if (paiement.isBankTransfer) return 'BANK_TRANSFER';
        if (paiement.isInternalTransfer) return 'INTERNAL_TRANSFER';
        return 'AGENCY';
    };

    const handleModeChange = (mode: string) => {
        // When switching away from INTERNAL_TRANSFER, clear the searched account selection
        // and restore the client's original savings account from the selected loan
        if (mode !== 'INTERNAL_TRANSFER' && paiement.isInternalTransfer) {
            setVirSelectedAccount(null);
            setVirSearchTerm('');
            setVirSearchResults([]);
            // Restore the original savings account linked to the loan (used by auto-debit)
            const originalSavingsId = selectedLoan?.application?.savingsAccountId
                || selectedLoan?.savingsAccountId
                || null;
            handleNumberChange('sourceSavingsAccountId', originalSavingsId);
        }
        // Auto-select the matching Mode de Remboursement from the reference list
        const codeMap: Record<string, string> = {
            AGENCY: 'AGENCY',
            AUTO_DEBIT: 'AUTO_DEBIT',
            HOME_COLLECTION: 'HOME_COLLECTION',
            MOBILE_MONEY: 'MOBILE_MONEY',
            BANK_TRANSFER: 'BANK_TRANSFER',
            INTERNAL_TRANSFER: 'INTERNAL_TRANSFER'
        };
        const matchingMode = modesRemboursement.find(m => m.code === codeMap[mode]);
        if (matchingMode) {
            handleDropdownChange('repaymentModeId', matchingMode.id);
        }
        handleCheckboxChange('isAutoDebit', mode === 'AUTO_DEBIT');
        handleCheckboxChange('isHomeCollection', mode === 'HOME_COLLECTION');
        handleCheckboxChange('isMobileMoney', mode === 'MOBILE_MONEY');
        handleCheckboxChange('isBankTransfer', mode === 'BANK_TRANSFER');
        handleCheckboxChange('isInternalTransfer', mode === 'INTERNAL_TRANSFER');
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
                                value={paiement.paymentDate ? parseLocalDate(paiement.paymentDate) : null}
                                onChange={(e) => handleDateChange('paymentDate', e.value as Date)}
                                className="w-full"
                                disabled={true}
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
                                value={paiement.valueDate ? parseLocalDate(paiement.valueDate) : null}
                                onChange={(e) => handleDateChange('valueDate', e.value as Date)}
                                className="w-full"
                                disabled={true}
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
                                <InputText
                                    id="sourceSavingsAccountId"
                                    value={savingsAccountInfo
                                        ? `${savingsAccountInfo.accountNumber} - ${savingsAccountInfo.client?.firstName || ''} ${savingsAccountInfo.client?.lastName || ''}`
                                        : (paiement.sourceSavingsAccountId ? `Compte ID: ${paiement.sourceSavingsAccountId}` : '')}
                                    className="w-full"
                                    disabled={true}
                                    placeholder="Sélectionnez un crédit pour récupérer le compte client"
                                />
                            </div>
                            <div className="field col-12 md:col-6">
                                <label className="font-semibold">Solde Disponible</label>
                                <InputText
                                    value={savingsAccountInfo?.availableBalance != null
                                        ? `${savingsAccountInfo.availableBalance.toLocaleString('fr-FR')} FBU`
                                        : '-'}
                                    className="w-full"
                                    disabled={true}
                                />
                            </div>
                            {!paiement.sourceSavingsAccountId && selectedLoan && (
                                <div className="col-12">
                                    <small className="text-orange-500">
                                        <i className="pi pi-exclamation-triangle mr-1"></i>
                                        Aucun compte épargne associé à cette demande de crédit
                                    </small>
                                </div>
                            )}
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

                    {/* Détails Virement Interne */}
                    {paiement.isInternalTransfer && (
                        <div className="mt-3 p-3 border-1 border-round border-primary surface-50">
                            <div className="flex align-items-center gap-2 mb-2">
                                <i className="pi pi-arrow-right-arrow-left text-primary"></i>
                                <h6 className="text-primary m-0">Virement Interne — Sélectionner le compte source</h6>
                            </div>
                            <p className="text-sm text-color-secondary mt-0 mb-3">
                                Sélectionnez le compte épargne qui va effectuer le paiement pour le bénéficiaire du crédit.
                                Ce compte est différent du compte épargne du client.
                            </p>

                            {/* Account search */}
                            {!virSelectedAccount && !isViewMode && (
                                <div className="mb-3">
                                    <label className="font-semibold block mb-2">
                                        <i className="pi pi-search mr-1"></i>
                                        Rechercher un compte épargne *
                                    </label>
                                    <div className="p-inputgroup">
                                        <InputText
                                            value={virSearchTerm}
                                            onChange={(e) => {
                                                setVirSearchTerm(e.target.value);
                                                searchVirementSavingsAccounts(e.target.value);
                                            }}
                                            placeholder="N° compte, nom ou prénom du titulaire..."
                                            className="w-full"
                                        />
                                        {virSearching && (
                                            <span className="p-inputgroup-addon">
                                                <i className="pi pi-spin pi-spinner"></i>
                                            </span>
                                        )}
                                    </div>
                                    <small className="text-500">Tapez au moins 2 caractères pour rechercher</small>

                                    {/* Search results */}
                                    {virSearchResults.length > 0 && (
                                        <div className="mt-2 border-1 border-round border-300 surface-card" style={{ maxHeight: '220px', overflowY: 'auto' }}>
                                            {virSearchResults.map((account: any) => {
                                                const balance = account.availableBalance ?? account.currentBalance ?? 0;
                                                const sufficient = paiement.amountReceived != null && balance >= paiement.amountReceived;
                                                return (
                                                    <div
                                                        key={account.id}
                                                        className="flex align-items-center justify-content-between p-3 cursor-pointer hover:surface-100 border-bottom-1 border-200"
                                                        onClick={() => handleVirAccountSelect(account)}
                                                    >
                                                        <div>
                                                            <div className="font-semibold">{account.accountNumber}</div>
                                                            <div className="text-sm text-600">
                                                                {account.client?.firstName || ''} {account.client?.lastName || account.clientName || ''}
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <div className={`font-bold ${sufficient ? 'text-green-600' : 'text-orange-600'}`}>
                                                                {balance.toLocaleString('fr-FR')} FBU
                                                            </div>
                                                            <small className={sufficient ? 'text-green-600' : 'text-orange-500'}>
                                                                {sufficient ? 'Solde suffisant' : 'Solde insuffisant'}
                                                            </small>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                    {virSearchTerm.length >= 2 && !virSearching && virSearchResults.length === 0 && (
                                        <small className="text-orange-500 block mt-1">
                                            <i className="pi pi-exclamation-triangle mr-1"></i>
                                            Aucun compte trouvé pour "{virSearchTerm}"
                                        </small>
                                    )}
                                </div>
                            )}

                            {/* Selected account display */}
                            {virSelectedAccount && (
                                <div className={`p-3 border-round border-1 mb-3 ${
                                    (virSelectedAccount.availableBalance ?? 0) >= (paiement.amountReceived || 0)
                                        ? 'border-green-300 bg-green-50'
                                        : 'border-red-300 bg-red-50'
                                }`}>
                                    <div className="flex align-items-center justify-content-between mb-2">
                                        <div className="flex align-items-center gap-2">
                                            <i className="pi pi-wallet text-primary"></i>
                                            <strong>Compte sélectionné</strong>
                                        </div>
                                        {!isViewMode && (
                                            <button
                                                type="button"
                                                className="p-button p-button-text p-button-sm p-button-danger"
                                                onClick={clearVirAccount}
                                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}
                                            >
                                                <i className="pi pi-times mr-1"></i> Changer
                                            </button>
                                        )}
                                    </div>
                                    <div className="formgrid grid">
                                        <div className="col-12 md:col-4">
                                            <small className="text-600">N° Compte</small>
                                            <p className="mt-1 mb-0 font-semibold">{virSelectedAccount.accountNumber}</p>
                                        </div>
                                        <div className="col-12 md:col-4">
                                            <small className="text-600">Titulaire</small>
                                            <p className="mt-1 mb-0 font-semibold">
                                                {virSelectedAccount.client?.firstName || ''} {virSelectedAccount.client?.lastName || virSelectedAccount.clientName || ''}
                                            </p>
                                        </div>
                                        <div className="col-12 md:col-4">
                                            <small className="text-600">Solde Disponible</small>
                                            <p className={`mt-1 mb-0 font-bold ${
                                                (virSelectedAccount.availableBalance ?? 0) >= (paiement.amountReceived || 0)
                                                    ? 'text-green-600' : 'text-red-600'
                                            }`}>
                                                {(virSelectedAccount.availableBalance ?? virSelectedAccount.currentBalance ?? 0).toLocaleString('fr-FR')} FBU
                                            </p>
                                            {(virSelectedAccount.availableBalance ?? 0) < (paiement.amountReceived || 0) && (
                                                <small className="text-red-600">
                                                    <i className="pi pi-exclamation-triangle mr-1"></i>Solde insuffisant
                                                </small>
                                            )}
                                            {(virSelectedAccount.availableBalance ?? 0) >= (paiement.amountReceived || 0) && paiement.amountReceived && (
                                                <small className="text-green-600">
                                                    <i className="pi pi-check-circle mr-1"></i>Solde suffisant
                                                </small>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Référence interne */}
                            <div className="field mb-0">
                                <label htmlFor="internalTransferReference" className="font-semibold">
                                    Référence Interne
                                </label>
                                <InputText
                                    id="internalTransferReference"
                                    name="internalTransferReference"
                                    value={paiement.internalTransferReference || ''}
                                    onChange={handleChange}
                                    className="w-full"
                                    disabled={isViewMode}
                                    placeholder="Ex: VIR-INT-2026..."
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
